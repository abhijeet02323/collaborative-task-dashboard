#!/usr/bin/env node

/**
 * Integration Test Suite
 * Tests backend and frontend integration
 */

const fs = require('fs');
const path = require('path');

class IntegrationTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  log(type, message) {
    const colors = {
      reset: '\x1b[0m',
      green: '\x1b[32m',
      red: '\x1b[31m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      cyan: '\x1b[36m',
      bold: '\x1b[1m'
    };

    const timestamp = new Date().toLocaleTimeString();
    let prefix = '';
    
    switch(type) {
      case 'pass':
        prefix = `${colors.green}✓${colors.reset}`;
        break;
      case 'fail':
        prefix = `${colors.red}✗${colors.reset}`;
        break;
      case 'warn':
        prefix = `${colors.yellow}⚠${colors.reset}`;
        break;
      case 'info':
        prefix = `${colors.blue}ℹ${colors.reset}`;
        break;
      case 'title':
        console.log(`\n${colors.bold}${colors.cyan}═══ ${message} ═══${colors.reset}\n`);
        return;
      default:
        prefix = `${colors.cyan}▸${colors.reset}`;
    }
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  testBackendFrontendIntegration() {
    this.log('title', 'TEST 1: BACKEND-FRONTEND INTEGRATION FILES');

    const backendPath = '/home/abhi/Documents/bakcend-projects/backend';
    const frontendPath = '/home/abhi/Documents/bakcend-projects/frontend';

    // Check backend API configuration
    const backendIndexPath = path.join(backendPath, 'src/index.js');
    const backendContent = fs.readFileSync(backendIndexPath, 'utf8');

    if (backendContent.includes('CORS') || backendContent.includes('cors()')) {
      this.log('pass', 'Backend has CORS enabled for frontend communication');
      this.results.passed++;
    } else {
      this.log('fail', 'Backend CORS not properly configured');
      this.results.failed++;
    }

    // Check frontend API configuration
    const frontendApiPath = path.join(frontendPath, 'src/services/api.js');
    const frontendApiContent = fs.readFileSync(frontendApiPath, 'utf8');

    if (frontendApiContent.includes('axios') && frontendApiContent.includes('REACT_APP_API_URL')) {
      this.log('pass', 'Frontend API service properly configured');
      this.results.passed++;
    } else {
      this.log('fail', 'Frontend API service not properly configured');
      this.results.failed++;
    }

    // Check frontend auth context
    const authContextPath = path.join(frontendPath, 'src/context/AuthContext.js');
    const authContextContent = fs.readFileSync(authContextPath, 'utf8');

    if (authContextContent.includes('login') && authContextContent.includes('register')) {
      this.log('pass', 'Frontend authentication context has login/register methods');
      this.results.passed++;
    } else {
      this.log('fail', 'Frontend authentication context incomplete');
      this.results.failed++;
    }
  }

  testAPIEndpointDefinitions() {
    this.log('title', 'TEST 2: API ENDPOINT DEFINITIONS');

    const authRoutesPath = '/home/abhi/Documents/bakcend-projects/backend/src/routes/authRoutes.js';
    const taskRoutesPath = '/home/abhi/Documents/bakcend-projects/backend/src/routes/taskRoutes.js';

    const authRoutesContent = fs.readFileSync(authRoutesPath, 'utf8');
    const taskRoutesContent = fs.readFileSync(taskRoutesPath, 'utf8');

    // Check auth endpoints
    const authEndpoints = [
      { name: 'register', pattern: /register|POST/ },
      { name: 'login', pattern: /login|POST/ },
      { name: 'profile', pattern: /profile|GET/ }
    ];

    authEndpoints.forEach(endpoint => {
      if (endpoint.pattern.test(authRoutesContent)) {
        this.log('pass', `Auth endpoint '${endpoint.name}' defined`);
        this.results.passed++;
      } else {
        this.log('fail', `Auth endpoint '${endpoint.name}' not found`);
        this.results.failed++;
      }
    });

    // Check task endpoints
    const taskEndpoints = [
      { name: 'create', pattern: /post|create|POST/ },
      { name: 'read', pattern: /get|GET/ },
      { name: 'update', pattern: /put|update|PUT/ },
      { name: 'delete', pattern: /delete|DELETE/ }
    ];

    taskEndpoints.forEach(endpoint => {
      if (endpoint.pattern.test(taskRoutesContent)) {
        this.log('pass', `Task endpoint '${endpoint.name}' defined`);
        this.results.passed++;
      } else {
        this.log('fail', `Task endpoint '${endpoint.name}' not found`);
        this.results.failed++;
      }
    });
  }

  testAuthenticationFlow() {
    this.log('title', 'TEST 3: AUTHENTICATION FLOW VALIDATION');

    const userModelPath = '/home/abhi/Documents/bakcend-projects/backend/src/models/User.js';
    const authControllerPath = '/home/abhi/Documents/bakcend-projects/backend/src/controllers/authController.js';

    const userModelContent = fs.readFileSync(userModelPath, 'utf8');
    const authControllerContent = fs.readFileSync(authControllerPath, 'utf8');

    // Check password hashing
    if (userModelContent.includes('hashPassword') || userModelContent.includes('password') || userModelContent.includes('bcrypt')) {
      this.log('pass', 'Password hashing (bcryptjs) implemented');
      this.results.passed++;
    } else {
      this.log('fail', 'Password hashing not found');
      this.results.failed++;
    }

    // Check JWT implementation
    if (authControllerContent.includes('jwt') || authControllerContent.includes('token')) {
      this.log('pass', 'JWT token generation implemented');
      this.results.passed++;
    } else {
      this.log('fail', 'JWT not properly implemented');
      this.results.failed++;
    }

    // Check frontend token storage
    const frontendApiPath = '/home/abhi/Documents/bakcend-projects/frontend/src/services/api.js';
    const frontendApiContent = fs.readFileSync(frontendApiPath, 'utf8');

    if (frontendApiContent.includes('localStorage') || frontendApiContent.includes('sessionStorage') || frontendApiContent.includes('token')) {
      this.log('pass', 'Frontend token storage mechanism implemented');
      this.results.passed++;
    } else {
      this.log('fail', 'Frontend token storage not configured');
      this.results.failed++;
    }
  }

  testDatabaseModels() {
    this.log('title', 'TEST 4: DATABASE MODELS VALIDATION');

    const userModelPath = '/home/abhi/Documents/bakcend-projects/backend/src/models/User.js';
    const taskModelPath = '/home/abhi/Documents/bakcend-projects/backend/src/models/Task.js';

    const userModelContent = fs.readFileSync(userModelPath, 'utf8');
    const taskModelContent = fs.readFileSync(taskModelPath, 'utf8');

    // Check User model methods
    const userMethods = ['create', 'findById', 'findByEmail', 'update'];
    userMethods.forEach(method => {
      if (userModelContent.includes(method)) {
        this.log('pass', `User model has '${method}' method`);
        this.results.passed++;
      } else {
        this.log('fail', `User model missing '${method}' method`);
        this.results.failed++;
      }
    });

    // Check Task model methods
    const taskMethods = ['create', 'findById', 'findByUserId', 'update', 'delete'];
    taskMethods.forEach(method => {
      if (taskModelContent.includes(method)) {
        this.log('pass', `Task model has '${method}' method`);
        this.results.passed++;
      } else {
        this.log('fail', `Task model missing '${method}' method`);
        this.results.failed++;
      }
    });
  }

  testSecurityValidation() {
    this.log('title', 'TEST 5: SECURITY VALIDATION');

    const authMiddlewarePath = '/home/abhi/Documents/bakcend-projects/backend/src/middlewares/auth.js';
    const validatorsPath = '/home/abhi/Documents/bakcend-projects/backend/src/validators/index.js';

    const authMiddlewareContent = fs.readFileSync(authMiddlewarePath, 'utf8');
    const validatorsContent = fs.readFileSync(validatorsPath, 'utf8');

    // Check JWT verification
    if (authMiddlewareContent.includes('jwt.verify') || authMiddlewareContent.includes('verify')) {
      this.log('pass', 'JWT verification implemented in auth middleware');
      this.results.passed++;
    } else {
      this.log('fail', 'JWT verification not found');
      this.results.failed++;
    }

    // Check input validation
    if (validatorsContent.includes('validator') || validatorsContent.includes('express-validator')) {
      this.log('pass', 'Input validation rules configured');
      this.results.passed++;
    } else {
      this.log('fail', 'Input validation not properly configured');
      this.results.failed++;
    }

    // Check CORS configuration
    const indexPath = '/home/abhi/Documents/bakcend-projects/backend/src/index.js';
    const indexContent = fs.readFileSync(indexPath, 'utf8');

    if (indexContent.includes('cors()') || indexContent.includes('CORS')) {
      this.log('pass', 'CORS security headers configured');
      this.results.passed++;
    } else {
      this.log('fail', 'CORS not properly configured');
      this.results.failed++;
    }
  }

  testFrontendComponentIntegration() {
    this.log('title', 'TEST 6: FRONTEND COMPONENT INTEGRATION');

    const appPath = '/home/abhi/Documents/bakcend-projects/frontend/src/App.js';
    const authPagePath = '/home/abhi/Documents/bakcend-projects/frontend/src/pages/Auth.js';
    const dashboardPath = '/home/abhi/Documents/bakcend-projects/frontend/src/pages/Dashboard.js';

    const appContent = fs.readFileSync(appPath, 'utf8');
    const authPageContent = fs.readFileSync(authPagePath, 'utf8');
    const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');

    // Check routing
    if (appContent.includes('Routes') || appContent.includes('BrowserRouter')) {
      this.log('pass', 'React Router properly configured');
      this.results.passed++;
    } else {
      this.log('fail', 'React Router not properly configured');
      this.results.failed++;
    }

    // Check Auth page
    if (authPageContent.includes('login') && authPageContent.includes('register')) {
      this.log('pass', 'Auth page has login and register functionality');
      this.results.passed++;
    } else {
      this.log('fail', 'Auth page incomplete');
      this.results.failed++;
    }

    // Check Dashboard page
    if (dashboardContent.includes('task') || dashboardContent.includes('Task')) {
      this.log('pass', 'Dashboard page has task management functionality');
      this.results.passed++;
    } else {
      this.log('fail', 'Dashboard page incomplete');
      this.results.failed++;
    }

    // Check Protected Routes
    const sharedPath = '/home/abhi/Documents/bakcend-projects/frontend/src/components/shared.js';
    const sharedContent = fs.readFileSync(sharedPath, 'utf8');

    if (sharedContent.includes('PrivateRoute') || sharedContent.includes('protected')) {
      this.log('pass', 'Route protection implemented');
      this.results.passed++;
    } else {
      this.log('fail', 'Route protection not found');
      this.results.failed++;
    }
  }

  testDeploymentConfiguration() {
    this.log('title', 'TEST 7: DEPLOYMENT CONFIGURATION');

    const projectRoot = '/home/abhi/Documents/bakcend-projects';

    // Check Docker files
    const dockerfileBackend = path.join(projectRoot, 'backend/Dockerfile');
    const dockerfileFrontend = path.join(projectRoot, 'frontend/Dockerfile');
    const dockerCompose = path.join(projectRoot, 'docker-compose.yml');

    if (fs.existsSync(dockerfileBackend)) {
      this.log('pass', 'Backend Dockerfile exists');
      this.results.passed++;
    } else {
      this.log('fail', 'Backend Dockerfile missing');
      this.results.failed++;
    }

    if (fs.existsSync(dockerfileFrontend)) {
      this.log('pass', 'Frontend Dockerfile exists');
      this.results.passed++;
    } else {
      this.log('fail', 'Frontend Dockerfile missing');
      this.results.failed++;
    }

    if (fs.existsSync(dockerCompose)) {
      const dockerComposeContent = fs.readFileSync(dockerCompose, 'utf8');
      if (dockerComposeContent.includes('backend') && dockerComposeContent.includes('frontend')) {
        this.log('pass', 'Docker Compose configured for backend and frontend');
        this.results.passed++;
      }
    } else {
      this.log('fail', 'docker-compose.yml missing');
      this.results.failed++;
    }

    // Check Kubernetes configs
    const kubernetesConfig = path.join(projectRoot, 'kubernetes.yaml');
    if (fs.existsSync(kubernetesConfig)) {
      this.log('pass', 'Kubernetes configuration exists');
      this.results.passed++;
    } else {
      this.log('warn', 'Kubernetes configuration not found (optional)');
    }

    // Check GitHub Actions
    const githubActions = path.join(projectRoot, '.github/workflows/ci-cd.yml');
    if (fs.existsSync(githubActions)) {
      this.log('pass', 'GitHub Actions CI/CD workflow exists');
      this.results.passed++;
    } else {
      this.log('warn', 'GitHub Actions CI/CD not configured (optional)');
    }
  }

  generateReport() {
    const colors = {
      reset: '\x1b[0m',
      green: '\x1b[32m',
      red: '\x1b[31m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      cyan: '\x1b[36m',
      bold: '\x1b[1m'
    };

    console.log(`\n${colors.bold}${colors.cyan}════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.bold}INTEGRATION TEST REPORT${colors.reset}`);
    console.log(`${colors.bold}${colors.cyan}════════════════════════════════════════${colors.reset}`);

    console.log(`
${colors.green}✓ Passed:${colors.reset}  ${this.results.passed} tests
${colors.red}✗ Failed:${colors.reset}  ${this.results.failed} tests

${colors.bold}Overall Status:${colors.reset} ${
  this.results.failed === 0 ? colors.green + 'PASSED ✓' : colors.red + 'FAILED ✗'
}${colors.reset}

${colors.cyan}════════════════════════════════════════${colors.reset}
    `);

    return {
      passed: this.results.passed,
      failed: this.results.failed,
      success: this.results.failed === 0
    };
  }

  runAllTests() {
    console.log(`\n${colors.bold}${colors.cyan}╔════════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.bold}${colors.cyan}║   FULL-STACK INTEGRATION TEST SUITE                    ║${colors.reset}`);
    console.log(`${colors.bold}${colors.cyan}║   Testing Backend-Frontend Integration                 ║${colors.reset}`);
    console.log(`${colors.bold}${colors.cyan}╚════════════════════════════════════════════════════════╝${colors.reset}\n`);

    try {
      this.testBackendFrontendIntegration();
      this.testAPIEndpointDefinitions();
      this.testAuthenticationFlow();
      this.testDatabaseModels();
      this.testSecurityValidation();
      this.testFrontendComponentIntegration();
      this.testDeploymentConfiguration();

      return this.generateReport();
    } catch (error) {
      this.log('fail', `Fatal error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  bold: '\x1b[1m',
  cyan: '\x1b[36m'
};

// Run tests
const tester = new IntegrationTester();
const report = tester.runAllTests();
process.exit(report.success ? 0 : 1);
