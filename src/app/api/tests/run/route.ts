import { NextRequest, NextResponse } from 'next/server';
import { testSuite } from '@/lib/test-suite';

export async function POST(request: NextRequest) {
  try {
    const { suite = 'all' } = await request.json();

    console.log(`🧪 Démarrage tests: ${suite}`);
    
    let results;
    
    switch (suite) {
      case 'database':
        results = [await testSuite.runDatabaseTests()];
        break;
      case 'api':
        results = [await testSuite.runApiTests()];
        break;
      case 'security':
        results = [await testSuite.runSecurityTests()];
        break;
      case 'performance':
        results = [await testSuite.runPerformanceTests()];
        break;
      case 'ux':
        results = [await testSuite.runUxTests()];
        break;
      case 'all':
      default:
        results = await testSuite.runAllTests();
        break;
    }

    const report = testSuite.generateReport(results);

    // Calculer statistiques globales
    const totalTests = results.reduce((sum, suite) => sum + suite.tests.length, 0);
    const totalPass = results.reduce((sum, suite) => sum + suite.passCount, 0);
    const totalFail = results.reduce((sum, suite) => sum + suite.failCount, 0);
    const totalDuration = results.reduce((sum, suite) => sum + suite.totalDuration, 0);
    const successRate = totalTests > 0 ? (totalPass / totalTests) * 100 : 0;

    return NextResponse.json({
      success: true,
      suite,
      timestamp: new Date().toISOString(),
      summary: {
        totalTests,
        totalPass,
        totalFail,
        successRate: Math.round(successRate * 100) / 100,
        totalDuration
      },
      results,
      report
    });

  } catch (error) {
    console.error('Test execution error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error during test execution',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'TechSupport SAV Test Suite API',
    endpoints: {
      'POST /api/tests/run': 'Run test suites',
      'GET /api/tests/status': 'Get test status'
    },
    availableSuites: [
      'all',
      'database', 
      'api', 
      'security', 
      'performance', 
      'ux'
    ]
  });
}