import { GET } from './ajax.js'

export async function clearAll() {
    // Send delete request
    await GET('removeallcourses')

    // Reload to make sure everything updates
    location.reload()
}