import { auth } from "@/lib/auth/config";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "antd";
import {
  FormOutlined,
  TeamOutlined,
  QuestionCircleOutlined,
  AppstoreOutlined,
  LoginOutlined,
} from "@ant-design/icons";

export default async function HomePage() {
  const session = await auth();

  // Not logged in - show login page
  if (!session) {
    redirect("/api/auth/signin");
  }

  const isAdmin = session.user.role === "ADMIN" || session.user.role === "MODERATOR";
  const isApproved = session.user.approved;

  return (
    <main className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-4xl">
        {/* Hero Section */}
        <div className="text-center">
          <div className="mb-4 text-6xl">🦊</div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Bienvenue sur Fox Club
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Bonjour <strong>{session.user.name || session.user.email}</strong>
          </p>

          {/* Pending Approval Message */}
          {!isApproved && !isAdmin && (
            <div className="mt-8 rounded-lg bg-orange-50 border border-orange-200 p-6">
              <p className="text-orange-800 font-medium">
                ⏳ Votre compte est en attente d&apos;approbation par un administrateur.
              </p>
              <p className="mt-2 text-sm text-orange-600">
                Vous recevrez un email une fois votre compte approuvé.
              </p>
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-10">
            <h2 className="mb-6 text-xl font-semibold text-gray-900">
              Accès rapide
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {/* User Form */}
              {isApproved && (
                <Link
                  href="/form"
                  className="block rounded-lg border-2 border-primary-500 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-primary-600"
                >
                  <FormOutlined className="text-3xl text-primary-600" />
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">
                    Mon Formulaire
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">
                    Remplir ou modifier mes préférences
                  </p>
                </Link>
              )}

              {/* Admin Links */}
              {isAdmin && (
                <>
                  <Link
                    href="/admin/users"
                    className="block rounded-lg border-2 border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-primary-500"
                  >
                    <TeamOutlined className="text-3xl text-primary-600" />
                    <h3 className="mt-4 text-lg font-semibold text-gray-900">
                      Utilisateurs
                    </h3>
                    <p className="mt-2 text-sm text-gray-600">
                      Gérer les utilisateurs et approbations
                    </p>
                  </Link>

                  <Link
                    href="/admin/question-families"
                    className="block rounded-lg border-2 border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-primary-500"
                  >
                    <AppstoreOutlined className="text-3xl text-primary-600" />
                    <h3 className="mt-4 text-lg font-semibold text-gray-900">
                      Familles de questions
                    </h3>
                    <p className="mt-2 text-sm text-gray-600">
                      Créer et organiser les familles
                    </p>
                  </Link>

                  <Link
                    href="/admin/questions"
                    className="block rounded-lg border-2 border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-primary-500"
                  >
                    <QuestionCircleOutlined className="text-3xl text-primary-600" />
                    <h3 className="mt-4 text-lg font-semibold text-gray-900">
                      Questions
                    </h3>
                    <p className="mt-2 text-sm text-gray-600">
                      Gérer les questions du formulaire
                    </p>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="mt-16 rounded-lg bg-primary-50 p-6">
            <h3 className="text-lg font-semibold text-primary-900">
              À propos de Fox Club
            </h3>
            <p className="mt-2 text-sm text-primary-800">
              Une plateforme de gestion de formulaires et de préférences.
              {isAdmin && " Vous avez accès à l'administration complète."}
              {!isAdmin && isApproved && " Vous pouvez remplir votre formulaire."}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
