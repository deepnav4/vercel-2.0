import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [repoUrl, setRepoUrl] = useState('')
  const [deploymentId, setDeploymentId] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let interval: number | undefined;
    
    if (deploymentId && status !== 'deployed') {
      interval = setInterval(async () => {
        try {
          const response = await fetch(`${import.meta.env.VITE_UPLOAD_SERVER_URL}/status?id=${deploymentId}`)
          const data = await response.json()
          
          if (data.status) {
            setStatus(data.status)
            
            if (data.status === 'deployed') {
              clearInterval(interval)
              setLoading(false)
            }
          }
        } catch (err) {
          console.error('Error polling status:', err)
        }
      }, 2000) // Poll every 2 seconds
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [deploymentId, status])

  const handleDeploy = async () => {
    if (!repoUrl.trim()) {
      setError('Please enter a repository URL')
      return
    }

    setLoading(true)
    setError('')
    setDeploymentId('')
    setStatus('')

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
        setDeploymentId(data.folderName)
        setStatus('uploaded')
      } else {
        setError(data.message || 'Deployment failed')
        setLoading(false)
      }
    } catch (err) {
      setError('Failed to connect to server')
      setLoading(false)
    }
  }

  const getStatusDisplay = () => {
    switch(status) {
      case 'uploaded':
        return '📤 Uploading files...'
      case 'deploying':
        return '🚀 Building and deploying...'
      case 'deployed':
        return '✓ Deployment Complete!'
      default:
        return ''
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

      {deploymentId && status && (
        <div className={status === 'deployed' ? 'success' : 'deploying'}>
          <h2>{getStatusDisplay()}</h2>
          
          {status === 'deployed' ? (
            <>
              <p>Your site is live at:</p>
              <a 
                href={`http://${deploymentId}.localhost:3001/index.html`}
                target="_blank" 
                rel="noopener noreferrer"
              >
                {deploymentId}.localhost:3001/index.html
              </a>
              <p className="id">Deployment ID: {deploymentId}</p>
            </>
          ) : (
            <div className="loader"></div>
          )}
        </div>
      )}
    </div>
  )
}

export default App
