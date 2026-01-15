#!/usr/bin/env node

/**
 * Script de validation automatique de TechSupport SAV
 * Exécute tous les tests et génère un rapport de santé
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:3000';
const TEST_API = `${API_BASE}/api/tests/run`;

// Couleurs pour le terminal
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step) {
  log(`\n🔸 ${step}`, 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Fonction pour faire des requêtes HTTP
function makeRequest(url, data = null) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : null;
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: url.replace(API_BASE, ''),
      method: data ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData ? Buffer.byteLength(postData) : 0
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

// Vérifier si le serveur est en ligne
async function checkServerHealth() {
  logStep('Vérification santé du serveur...');
  
  try {
    const response = await makeRequest('/api/health');
    if (response.status === 200) {
      logSuccess('Serveur en ligne et répondant');
      return true;
    } else {
      logError(`Serveur répond avec statut: ${response.status}`);
      return false;
    }
  } catch (error) {
    logError(`Serveur inaccessible: ${error.message}`);
    return false;
  }
}

// Exécuter une suite de tests
async function runTestSuite(suiteName) {
  logStep(`Exécution suite de tests: ${suiteName}`);
  
  try {
    const response = await makeRequest('/api/tests/run', { suite: suiteName });
    
    if (response.status !== 200) {
      logError(`Erreur API (${response.status}): ${JSON.stringify(response.data)}`);
      return null;
    }

    const result = response.data;
    const { summary } = result;
    
    logInfo(`Tests exécutés: ${summary.totalTests}`);
    logSuccess(`Réussis: ${summary.totalPass}`);
    
    if (summary.totalFail > 0) {
      logError(`Échoués: ${summary.totalFail}`);
    }
    
    logInfo(`Taux de succès: ${summary.successRate.toFixed(1)}%`);
    logInfo(`Durée: ${summary.totalDuration}ms`);
    
    return result;
  } catch (error) {
    logError(`Erreur lors de l'exécution des tests: ${error.message}`);
    return null;
  }
}

// Générer un rapport de santé
function generateHealthReport(testResults) {
  const timestamp = new Date().toISOString();
  let report = `# Rapport de Santé - TechSupport SAV\n`;
  report += `Généré le: ${new Date(timestamp).toLocaleString('fr-FR')}\n\n`;
  
  report += `## 📊 Résumé Global\n\n`;
  
  let totalTests = 0;
  let totalPass = 0;
  let totalFail = 0;
  let totalDuration = 0;
  
  testResults.forEach(result => {
    if (result) {
      totalTests += result.summary.totalTests;
      totalPass += result.summary.totalPass;
      totalFail += result.summary.totalFail;
      totalDuration += result.summary.totalDuration;
    }
  });
  
  const successRate = totalTests > 0 ? (totalPass / totalTests) * 100 : 0;
  
  report += `- **Tests Total**: ${totalTests}\n`;
  report += `- **Réussis**: ${totalPass} (${successRate.toFixed(1)}%)\n`;
  report += `- **Échoués**: ${totalFail}\n`;
  report += `- **Durée Totale**: ${totalDuration}ms\n\n`;
  
  // Évaluation de la santé
  report += `## 🏥 État de Santé\n\n`;
  
  if (successRate >= 95) {
    report += `🟢 **EXCELLENT** - Plateforme en parfaite santé\n`;
  } else if (successRate >= 85) {
    report += `🟡 **BON** - Plateforme fonctionnelle avec quelques améliorations possibles\n`;
  } else if (successRate >= 70) {
    report += `🟠 **ATTENTION** - Problèmes à résoudre avant production\n`;
  } else {
    report += `🔴 **CRITIQUE** - Problèmes majeurs à corriger immédiatement\n`;
  }
  
  report += `\n`;
  
  // Détails par suite
  report += `## 📋 Détails par Suite\n\n`;
  
  testResults.forEach(result => {
    if (result) {
      report += `### ${result.suite.toUpperCase()}\n`;
      report += `- Tests: ${result.summary.totalTests}\n`;
      report += `- Succès: ${result.summary.totalPass}\n`;
      report += `- Échecs: ${result.summary.totalFail}\n`;
      report += `- Taux: ${result.summary.successRate.toFixed(1)}%\n`;
      report += `- Durée: ${result.summary.totalDuration}ms\n\n`;
    }
  });
  
  // Recommandations
  report += `## 💡 Recommandations\n\n`;
  
  if (successRate >= 95) {
    report += `- ✅ Plateforme prête pour le déploiement en production\n`;
    report += `- 🚀 Considérer la mise en ligne progressive\n`;
  } else if (successRate >= 85) {
    report += `- 🔧 Corriger les tests échoués avant déploiement\n`;
    report += `- 📊 Surveiller les métriques de performance\n`;
  } else {
    report += `- 🚨 Prioriser la correction des problèmes critiques\n`;
    report += `- 🔄 Relancer les tests après corrections\n`;
  }
  
  report += `\n---\n`;
  report += `*Rapport généré automatiquement par TechSupport SAV Validation Suite*\n`;
  
  return report;
}

// Sauvegarder le rapport
function saveReport(report, filename) {
  const reportsDir = path.join(__dirname, '../reports');
  
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  const filepath = path.join(reportsDir, filename);
  fs.writeFileSync(filepath, report, 'utf8');
  
  logSuccess(`Rapport sauvegardé: ${filepath}`);
}

// Fonction principale
async function main() {
  log('🧪 TechSupport SAV - Suite de Validation Automatique', 'magenta');
  log('=' .repeat(60), 'cyan');
  
  // 1. Vérifier la santé du serveur
  const serverHealthy = await checkServerHealth();
  if (!serverHealthy) {
    logError('Arrêt du script - Serveur inaccessible');
    process.exit(1);
  }
  
  // 2. Exécuter les suites de tests
  const testSuites = ['database', 'api', 'security', 'performance', 'ux'];
  const testResults = [];
  
  for (const suite of testSuites) {
    const result = await runTestSuite(suite);
    testResults.push(result);
    
    // Pause entre les suites
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // 3. Générer et sauvegarder le rapport
  const healthReport = generateHealthReport(testResults);
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportFilename = `health-report-${timestamp}.md`;
  
  saveReport(healthReport, reportFilename);
  
  // 4. Afficher le résumé final
  log('\n' + '='.repeat(60), 'cyan');
  log('📊 RÉSUMÉ FINAL', 'magenta');
  log('=' .repeat(60), 'cyan');
  
  const totalTests = testResults.reduce((sum, r) => sum + (r?.summary.totalTests || 0), 0);
  const totalPass = testResults.reduce((sum, r) => sum + (r?.summary.totalPass || 0), 0);
  const totalFail = testResults.reduce((sum, r) => sum + (r?.summary.totalFail || 0), 0);
  const successRate = totalTests > 0 ? (totalPass / totalTests) * 100 : 0;
  
  logInfo(`Tests Total: ${totalTests}`);
  logSuccess(`Réussis: ${totalPass}`);
  
  if (totalFail > 0) {
    logError(`Échoués: ${totalFail}`);
  }
  
  logInfo(`Taux de succès: ${successRate.toFixed(1)}%`);
  
  // État final
  if (successRate >= 95) {
    log('\n🎉 PLATEFORME EN EXCELLENTE SANTÉ - PRÊTE POUR PRODUCTION !', 'green');
  } else if (successRate >= 85) {
    log('\n✅ PLATEFORME BONNE - CORRECTIONS MINEURES RECOMMANDÉES', 'yellow');
  } else {
    log('\n⚠️  PLATEFORME NÉCESSITE DES CORRECTIONS AVANT PRODUCTION', 'red');
  }
  
  logInfo(`Rapport détaillé: reports/${reportFilename}`);
  
  // Code de sortie
  process.exit(successRate >= 85 ? 0 : 1);
}

// Gestion des erreurs non capturées
process.on('unhandledRejection', (reason, promise) => {
  logError(`Erreur non gérée: ${reason}`);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logError(`Exception non capturée: ${error.message}`);
  process.exit(1);
});

// Démarrer le script
if (require.main === module) {
  main().catch(error => {
    logError(`Erreur fatale: ${error.message}`);
    process.exit(1);
  });
}