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
import { LogoutButton } from "@/components/auth/logout-button";

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

export default async function AdminHomePage() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 p-4">
              <h1 className="text-lg font-semibold text-gray-900">
                {isAdmin ? "Fox Club Admin" : "Fox Club"}
              </h1>
              <p className="mt-1 text-sm text-gray-500">Navigation rapide</p>
            </div>
            <nav className="p-3">
              <section className="space-y-3">
                {isAdmin && (
                  <>
                    <h3 className="px-3 text-xs font-semibold uppercase text-gray-500">
                      Admin
                    </h3>
                    <ul className="space-y-2">
                      {adminNavLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                          <li key={link.href}>
                            <Link
                              href={link.href}
                              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-gray-900"
                            >
                              <Icon className="text-base text-gray-500" />
                              <span>{link.label}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </>
                )}

                <h3 className="px-3 text-xs font-semibold uppercase text-gray-500">
                  Utilisateur
                </h3>
                <ul className="space-y-2">
                  {userNavLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-gray-900"
                        >
                          <Icon className="text-base text-gray-500" />
                          <span>{link.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-4 border-t border-gray-200 pt-4">
                  <LogoutButton />
                </div>
              </section>
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 space-y-6">
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
                        Gerer les donnees et la configuration liees a cette
                        section.
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

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
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
          <span>Fox Club · Gestion des contenus et utilisateurs</span>
          <div className="flex items-center gap-4">
            <Link href="/form" className="hover:text-gray-700">
              Formulaire utilisateur
            </Link>
            {isAdmin && (
              <>
                <Link href="/admin/users" className="hover:text-gray-700">
                  Utilisateurs
                </Link>
                <Link
                  href="/admin/question-families"
                  className="hover:text-gray-700"
                >
                  Questions
                </Link>
              </>
            )}
            <Link href="/account/password" className="hover:text-gray-700">
              Mon compte
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
