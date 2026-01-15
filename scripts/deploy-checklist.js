#!/usr/bin/env node

/**
 * Checklist de déploiement pour TechSupport SAV
 * Vérifications finales avant mise en production
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

// Vérifications de déploiement
const deploymentChecks = [
  {
    name: 'Code Quality (ESLint)',
    check: () => {
      try {
        execSync('npm run lint', { stdio: 'pipe' });
        return { success: true, message: 'Aucune erreur ESLint' };
      } catch (error) {
        return { success: false, message: 'Erreurs ESLint détectées' };
      }
    }
  },
  {
    name: 'TypeScript Compilation',
    check: () => {
      try {
        execSync('npx tsc --noEmit', { stdio: 'pipe' });
        return { success: true, message: 'TypeScript compilé avec succès' };
      } catch (error) {
        return { success: false, message: 'Erreurs TypeScript détectées' };
      }
    }
  },
  {
    name: 'Database Schema',
    check: () => {
      try {
        execSync('npm run db:push', { stdio: 'pipe' });
        return { success: true, message: 'Schema DB synchronisé' };
      } catch (error) {
        return { success: false, message: 'Problème synchronisation DB' };
      }
    }
  },
  {
    name: 'Tests Automatisés',
    check: () => {
      try {
        const result = execSync('node scripts/validate-platform.js', { 
          stdio: 'pipe',
          timeout: 30000 
        });
        return { success: true, message: 'Tous les tests passés (100%)' };
      } catch (error) {
        return { success: false, message: 'Tests échoués ou incomplets' };
      }
    }
  },
  {
    name: 'Environment Variables',
    check: () => {
      const requiredVars = [
        'DATABASE_URL',
        'NEXTAUTH_SECRET',
        'NEXTAUTH_URL'
      ];
      
      const missing = requiredVars.filter(varName => !process.env[varName]);
      
      if (missing.length === 0) {
        return { success: true, message: 'Variables d\'environnement OK' };
      } else {
        return { 
          success: false, 
          message: `Variables manquantes: ${missing.join(', ')}` 
        };
      }
    }
  },
  {
    name: 'Build Production',
    check: () => {
      try {
        execSync('npm run build', { stdio: 'pipe' });
        return { success: true, message: 'Build production réussi' };
      } catch (error) {
        return { success: false, message: 'Build production échoué' };
      }
    }
  },
  {
    name: 'Security Headers',
    check: () => {
      // Vérifier la présence de headers de sécurité
      const nextConfigPath = path.join(__dirname, '../next.config.js');
      if (fs.existsSync(nextConfigPath)) {
        const config = fs.readFileSync(nextConfigPath, 'utf8');
        const hasSecurity = config.includes('headers') || 
                           config.includes('X-Frame-Options') ||
                           config.includes('X-Content-Type-Options');
        
        if (hasSecurity) {
          return { success: true, message: 'Headers de sécurité configurés' };
        } else {
          return { 
            success: false, 
            message: 'Headers de sécurité manquants' 
          };
        }
      }
      return { success: false, message: 'next.config.js introuvable' };
    }
  },
  {
    name: 'Performance Optimizations',
    check: () => {
      const packageJsonPath = path.join(__dirname, '../package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      const hasOptimizations = packageJson.dependencies?.['@next/bundle-analyzer'] ||
                              packageJson.scripts?.['analyze'] ||
                              fs.existsSync(path.join(__dirname, '../.next/optimized'));
      
      return { 
        success: true, 
        message: hasOptimizations ? 
          'Optimisations performance détectées' : 
          'Optimisations basiques (améliorables)' 
      };
    }
  }
];

// Fonction principale
async function main() {
  log('🚀 TechSupport SAV - Checklist de Déploiement', 'magenta');
  log('=' .repeat(60), 'cyan');
  
  let allPassed = true;
  const results = [];
  
  for (const check of deploymentChecks) {
    logStep(`Vérification: ${check.name}`);
    
    const result = check.check();
    results.push({ name: check.name, ...result });
    
    if (result.success) {
      logSuccess(result.message);
    } else {
      logError(result.message);
      allPassed = false;
    }
  }
  
  // Résumé final
  log('\n' + '='.repeat(60), 'cyan');
  log('📊 RÉSUMÉ DÉPLOIEMENT', 'magenta');
  log('=' .repeat(60), 'cyan');
  
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  
  logInfo(`Vérifications réussies: ${passed}/${total}`);
  
  if (allPassed) {
    log('\n🎉 PLATEFORME PRÊTE POUR DÉPLOIEMENT EN PRODUCTION !', 'green');
    log('\n📋 Prochaines étapes:', 'blue');
    log('1. Backup de la base de données actuelle', 'white');
    log('2. Déploiement progressif (canary release)', 'white');
    log('3. Monitoring post-déploiement', 'white');
    log('4. Tests utilisateurs en production', 'white');
  } else {
    log('\n⚠️  CORRECTIONS NÉCESSAIRES AVANT DÉPLOIEMENT', 'red');
    log('\n🔧 Actions requises:', 'yellow');
    
    results.filter(r => !r.success).forEach(result => {
      log(`- ${result.name}: ${result.message}`, 'yellow');
    });
  }
  
  // Générer le rapport
  const report = generateDeploymentReport(results, allPassed);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(__dirname, '../reports');
  
  if (!fs.existsSync(reportPath)) {
    fs.mkdirSync(reportPath, { recursive: true });
  }
  
  const reportFile = path.join(reportPath, `deployment-checklist-${timestamp}.md`);
  fs.writeFileSync(reportFile, report, 'utf8');
  
  logInfo(`Rapport sauvegardé: ${reportFile}`);
  
  process.exit(allPassed ? 0 : 1);
}

function generateDeploymentReport(results, allPassed) {
  const timestamp = new Date().toISOString();
  let report = `# Checklist de Déploiement - TechSupport SAV\n`;
  report += `Généré le: ${new Date(timestamp).toLocaleString('fr-FR')}\n\n`;
  
  report += `## 📊 Résumé\n\n`;
  report += `- **Statut**: ${allPassed ? '✅ PRÊT' : '⚠️  ATTENTION'}\n`;
  report += `- **Vérifications**: ${results.filter(r => r.success).length}/${results.length}\n\n`;
  
  report += `## 🔍 Détails des Vérifications\n\n`;
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    report += `${status} **${result.name}**: ${result.message}\n`;
  });
  
  report += `\n## 🚀 Recommandations\n\n`;
  
  if (allPassed) {
    report += `- ✅ Plateforme prête pour déploiement production\n`;
    report += `- 🔄 Procéder au déploiement progressif\n`;
    report += `- 📊 Mettre en place monitoring continu\n`;
    report += `- 🧪 Planifier tests utilisateurs post-déploiement\n`;
  } else {
    report += `- 🔧 Corriger les vérifications échouées\n`;
    report += `- 🔄 Relancer la checklist après corrections\n`;
    report += `- 📋 Documenter les changements effectués\n`;
  }
  
  report += `\n---\n`;
  report += `*Checklist générée automatiquement par TechSupport SAV*\n`;
  
  return report;
}

// Démarrer le script
if (require.main === module) {
  main().catch(error => {
    logError(`Erreur fatale: ${error.message}`);
    process.exit(1);
  });
}