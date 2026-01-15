# Guide de Dépannage

## Erreur: Module not found: Can't resolve 'fs/promises'

### Problème
Cette erreur se produit lorsque vous essayez d'utiliser des modules Node.js (comme `fs`, `fs/promises`, `path`, etc.) dans du code qui s'exécute côté client (navigateur).

### Solution
Déplacez la logique qui utilise les modules Node.js vers des API routes Next.js (côté serveur) et utilisez des hooks ou des fonctions asynchrones côté client pour appeler ces APIs.

### Exemple de correction

#### ❌ **Incorrect (côté client)**
```typescript
// src/components/my-component.tsx
import fs from 'fs/promises' // ERREUR!

export function MyComponent() {
  const handleClick = async () => {
    const data = await fs.readFile('file.txt') // Ne fonctionne pas dans le navigateur
  }
}
```

#### ✅ **Correct (séparation client/serveur)**

**1. Créer une API route (côté serveur)**
```typescript
// src/app/api/file-data/route.ts
import fs from 'fs/promises' // ✅ OK côté serveur

export async function GET() {
  try {
    const data = await fs.readFile('file.txt', 'utf-8')
    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }
}
```

**2. Utiliser un hook client (côté client)**
```typescript
// src/hooks/use-file-data.ts
export function useFileData() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/file-data')
      const result = await response.json()
      setData(result.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  return { data, loading, fetchData }
}
```

**3. Utiliser dans le composant**
```typescript
// src/components/my-component.tsx
import { useFileData } from '@/hooks/use-file-data'

export function MyComponent() {
  const { data, loading, fetchData } = useFileData()

  return (
    <div>
      <button onClick={fetchData}>Charger les données</button>
      {loading && <p>Chargement...</p>}
      {data && <p>{data}</p>}
    </div>
  )
}
```

### Modules Node.js courants qui causent cette erreur
- `fs` et `fs/promises`
- `path`
- `os`
- `crypto`
- `child_process`
- `cluster`
- `net`
- `tls`
- `dns`

### Alternatives côté client
- Pour les manipulations de fichiers: utiliser des `<input type="file">` et `FileReader`
- Pour les chemins: utiliser `new URL()` ou des manipulations de string
- Pour le crypto: utiliser `window.crypto.subtle` (Web Crypto API)
- Pour les requêtes HTTP: utiliser `fetch` ou `axios`

### Règle générale
- **Côté serveur** (API routes, middleware): tous les modules Node.js sont disponibles
- **Côté client** (composants React, hooks): uniquement les APIs web standards

### Vérification rapide
Pour savoir si votre code s'exécute côté client ou serveur:
```typescript
// Côté client uniquement
'use client'

// Côté serveur uniquement
export async function GET() { ... }

// Les composants React sont toujours côté client (avec 'use client')
```