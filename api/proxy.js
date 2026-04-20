export default async function handler(req, res) {
  let { target } = req.query;
  
  if (!target) {
    return res.status(400).json({ error: 'Endpoint target is required' });
  }

  // Handle nested paths (arrays or strings)
  if (Array.isArray(target)) {
    target = target.join('/');
  }

  const token = '3653406ff5d64204bc1534d558b4439a';
  const url = `https://api.football-data.org/v4/${target}`;

  try {
    const response = await fetch(url, {
      headers: {
        'X-Auth-Token': token
      }
    });
    
    // Parse response based on content type
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return res.status(response.status).json(data);
    } else {
      const text = await response.text();
      return res.status(response.status).send(text);
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
