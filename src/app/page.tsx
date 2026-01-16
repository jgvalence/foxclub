import Link from "next/link";
import {
  AppstoreOutlined,
  FormOutlined,
  UserOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth/config";

const adminNavLinks = [
  {
    href: "/admin/question-families",
    label: "Familles de questions",
    icon: AppstoreOutlined,
    description: "Creer et organiser les familles",
  },
  {
    href: "/admin/questions",
    label: "Questions",
    icon: FormOutlined,
    description: "Gerer les questions par famille",
  },
  {
    href: "/admin/users",
    label: "Utilisateurs",
    icon: UserOutlined,
    description: "Approbation et roles",
  },
];

const userNavLinks = [
  {
    href: "/form",
    label: "Formulaire utilisateur",
    icon: FormOutlined,
    description: "Remplir ou mettre a jour mon formulaire",
  },
  {
    href: "/account/password",
    label: "Mon compte",
    icon: SettingOutlined,
    description: "Changer mon mot de passe",
  },
];

export default async function HomePage() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="rounded-2xl border border-gray-200 bg-gradient-to-r from-orange-100 via-white to-orange-50 px-6 py-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase text-orange-500">
              Tableau de bord
            </p>
            <h2 className="text-3xl font-bold text-gray-900">
              {isAdmin
                ? "Bienvenue sur l'admin Fox Club"
                : "Bienvenue sur votre espace Fox Club"}
            </h2>
            <p className="text-sm text-gray-600">
              {isAdmin
                ? "Gerez les familles, questions et utilisateurs. Accedez aussi au formulaire tel que vu par les membres."
                : "Accedez a votre formulaire et a votre compte. Les sections admin sont reservees aux administrateurs."}
            </p>
          </div>
          {isAdmin && (
            <div className="flex flex-wrap gap-3">
              <Link href="/admin/question-families">
                <Button size="lg">Creer une famille</Button>
              </Link>
              <Link href="/admin/questions">
                <Button size="lg" variant="outline">
                  Ajouter une question
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Admin Cards */}
      {isAdmin && (
        <div className="grid gap-4 md:grid-cols-2">
          {adminNavLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-lg">
                <CardHeader className="flex flex-row items-center gap-3">
                  <div className="rounded-lg bg-orange-100 p-3 text-orange-600">
                    <link.icon />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{link.label}</CardTitle>
                    <CardDescription>{link.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Gerer les donnees et la configuration liees a cette section.
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* User Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {userNavLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-lg">
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-3 text-blue-600">
                  <link.icon />
                </div>
                <div>
                  <CardTitle className="text-lg">{link.label}</CardTitle>
                  <CardDescription>{link.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Acceder rapidement a vos espaces personnels.
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
