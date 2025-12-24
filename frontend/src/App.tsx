import { useState } from 'react'
import './App.css'

function App() {
  const [repoUrl, setRepoUrl] = useState('')
  const [deploymentId, setDeploymentId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleDeploy = async () => {
    if (!repoUrl.trim()) {
      setError('Please enter a repository URL')
      return
    }

    setLoading(true)
    setError('')
    setDeploymentId('')

    try {
      const response = await fetch(`${import.meta.env.VITE_UPLOAD_SERVER_URL}/deploy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ repoUrl }),
      })

      const data = await response.json()

      if (response.ok) {
        setDeploymentId(data.id)
      } else {
        setError(data.error || 'Deployment failed')
      }
    } catch (err) {
      setError('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <h1>⚡ Vercel Clone</h1>
      <p className="subtitle">Deploy your projects in seconds</p>

      <div className="deploy-section">
        <input
          type="text"
          placeholder="https://github.com/username/repo"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          disabled={loading}
        />
        <button onClick={handleDeploy} disabled={loading}>
          {loading ? 'Deploying...' : 'Deploy'}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {deploymentId && (
        <div className="success">
          <h2>✓ Deployment Successful!</h2>
          <p>Your site is live at:</p>
          <a 
            href={`http://${deploymentId}.localhost:3001`}
            target="_blank" 
            rel="noopener noreferrer"
          >
            {deploymentId}.localhost:3001
          </a>
          <p className="id">Deployment ID: {deploymentId}</p>
        </div>
      )}
    </div>
  )
}

export default App
