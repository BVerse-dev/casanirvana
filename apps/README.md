# Applications

Each directory under `apps/` is an independently installable and deployable Casa Nirvana application with its own lockfile.

| Directory | Runtime |
| --- | --- |
| `api` | Node.js Express API |
| `superadmin` | Next.js administration web app |
| `marketing-web` | Next.js public marketing web app |
| `resident-mobile` | Expo/React Native resident app |
| `guard-mobile` | Expo/React Native guard app |

Run package commands with `npm --prefix apps/<application> ...` from the repository root or run `npm ...` from the application directory. Cross-application contracts belong in the repository-level `supabase`, `scripts` or future `packages` directories, not in another application's source tree.
