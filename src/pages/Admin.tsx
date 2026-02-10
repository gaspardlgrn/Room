export default function Admin() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-black">Administration</h1>
        <p className="mt-2 text-sm text-gray-600">
          Gérez les utilisateurs et les droits d’accès.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Utilisateurs
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Ajoutez, désactivez ou supprimez des comptes via Clerk.
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Rôles
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Définissez les administrateurs et les permissions d’accès.
          </p>
        </div>
      </div>
    </div>
  );
}
