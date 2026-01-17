import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Question {
  id: string;
  text: string;
  order: number;
}

interface QuestionFamily {
  id: string;
  label: string;
  type: "TYPE_1" | "TYPE_2";
  order: number;
  questions: Question[];
}

interface FormAnswer {
  questionId: string;
  score: number;
  notes?: string;
  top?: boolean;
  bot?: boolean;
  talk?: boolean;
  include?: boolean;
}

/**
 * Get score emoji based on score value
 */
function getScoreEmoji(score: number): string {
  switch (score) {
    case 4:
      return "Fantasme";
    case 3:
      return "Ok";
    case 2:
      return "Curieux";
    case 1:
      return "Non";
    default:
      return "-";
  }
}

/**
 * Generate a PDF document from form answers
 */
export function generateFormPDF(
  questionFamilies: QuestionFamily[],
  answers: Record<string, FormAnswer>,
  userName?: string
): void {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Fox Club - Formulaire", pageWidth / 2, 15, { align: "center" });

  // User name and date
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const dateStr = new Date().toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  if (userName) {
    doc.text(`Utilisateur: ${userName}`, 14, 25);
  }
  doc.text(`Date: ${dateStr}`, pageWidth - 14, 25, { align: "right" });

  // Legend
  doc.setFontSize(9);
  doc.text(
    "Legende: Fantasme = Score 4 | Ok = Score 3 | Curieux = Score 2 | Non = Score 1",
    14,
    32
  );

  let startY = 38;

  // Process each question family
  questionFamilies.forEach((family, familyIndex) => {
    // Add new page if needed (leave space for header)
    if (startY > 180) {
      doc.addPage();
      startY = 15;
    }

    // Family title
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(family.label, 14, startY);
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.text(
      family.type === "TYPE_1" ? "(Score, Top, Bot, Talk)" : "(Score, Inclure)",
      14,
      startY + 5
    );

    startY += 10;

    // Build table data
    const headers =
      family.type === "TYPE_1"
        ? ["Question", "Score", "Top", "Bot", "Talk", "Notes"]
        : ["Question", "Score", "Inclure", "Notes"];

    const rows = family.questions.map((question) => {
      const answer: FormAnswer = answers[question.id] || {
        questionId: question.id,
        score: 1,
      };

      if (family.type === "TYPE_1") {
        return [
          question.text,
          getScoreEmoji(answer.score ?? 1),
          answer.top ? "Oui" : "-",
          answer.bot ? "Oui" : "-",
          answer.talk ? "Oui" : "-",
          answer.notes || "",
        ];
      } else {
        return [
          question.text,
          getScoreEmoji(answer.score ?? 1),
          answer.include ? "Oui" : "-",
          answer.notes || "",
        ];
      }
    });

    // Generate table
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: startY,
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [255, 237, 213], // orange-100
        textColor: [0, 0, 0],
        fontStyle: "bold",
      },
      columnStyles:
        family.type === "TYPE_1"
          ? {
              0: { cellWidth: 60 },
              1: { cellWidth: 20, halign: "center" },
              2: { cellWidth: 15, halign: "center" },
              3: { cellWidth: 15, halign: "center" },
              4: { cellWidth: 15, halign: "center" },
              5: { cellWidth: "auto" },
            }
          : {
              0: { cellWidth: 80 },
              1: { cellWidth: 25, halign: "center" },
              2: { cellWidth: 20, halign: "center" },
              3: { cellWidth: "auto" },
            },
      margin: { left: 14, right: 14 },
      didDrawPage: (data) => {
        // Footer with page number
        const pageCount = (doc as any).internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text(
          `Page ${data.pageNumber} / ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: "center" }
        );
      },
    });

    // Get the final Y position after the table
    startY = (doc as any).lastAutoTable.finalY + 10;

    // Add spacing between families
    if (familyIndex < questionFamilies.length - 1) {
      startY += 5;
    }
  });

  // Save the PDF
  const fileName = userName
    ? `foxclub-formulaire-${userName.toLowerCase().replace(/\s+/g, "-")}.pdf`
    : "foxclub-formulaire.pdf";
  doc.save(fileName);
}
