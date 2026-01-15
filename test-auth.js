const http = require('http');

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    req.on('error', reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function testAuth() {
  try {
    console.log('🔍 Test d\'authentification TechSupport Pro');
    
    // 1. Test des providers
    console.log('\n1. Test des providers OAuth...');
    const providersResponse = await makeRequest('http://localhost:3000/api/auth/providers');
    if (providersResponse.status === 200) {
      const providers = JSON.parse(providersResponse.data);
      console.log('✅ Providers disponibles:', Object.keys(providers));
    } else {
      console.log('❌ Providers endpoint failed:', providersResponse.status);
    }
    
    // 2. Test CSRF
    console.log('\n2. Test du token CSRF...');
    const csrfResponse = await makeRequest('http://localhost:3000/api/auth/csrf');
    if (csrfResponse.status === 200) {
      const { csrfToken } = JSON.parse(csrfResponse.data);
      console.log('✅ Token CSRF obtenu:', csrfToken.substring(0, 20) + '...');
      
      // 3. Test d'authentification avec credentials
      console.log('\n3. Test d\'authentification par credentials...');
      const postData = new URLSearchParams({
        email: 'admin@exemple.com',
        password: 'password123',
        csrfToken: csrfToken,
        callbackUrl: '/',
        json: 'true'
      }).toString();
      
      const authResponse = await makeRequest('http://localhost:3000/api/auth/callback/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData)
        },
        body: postData
      });
      
      console.log('Status auth:', authResponse.status);
      console.log('Headers auth:', authResponse.headers);
      
      // 4. Test de la session
      console.log('\n4. Test de la session...');
      const cookies = authResponse.headers['set-cookie'] || [];
      const cookieHeader = cookies.join('; ');
      
      const sessionResponse = await makeRequest('http://localhost:3000/api/auth/session', {
        headers: {
          'Cookie': cookieHeader
        }
      });
      
      if (sessionResponse.status === 200) {
        const session = JSON.parse(sessionResponse.data);
        if (session.user) {
          console.log('✅ Authentification réussie!');
          console.log('Utilisateur:', session.user.email);
          console.log('Rôle:', session.user.role);
          console.log('ID:', session.user.id);
        } else {
          console.log('❌ Aucune session trouvée');
          console.log('Session response:', session);
        }
      } else {
        console.log('❌ Session endpoint failed:', sessionResponse.status);
      }
    } else {
      console.log('❌ CSRF endpoint failed:', csrfResponse.status);
    }
    
    // 5. Test de la page de connexion
    console.log('\n5. Test de la page de connexion...');
    const signinResponse = await makeRequest('http://localhost:3000/auth/signin');
    if (signinResponse.status === 200) {
      console.log('✅ Page de connexion accessible');
    } else {
      console.log('❌ Page de connexion inaccessible:', signinResponse.status);
    }
    
    console.log('\n🎉 Test terminé!');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

testAuth();