#!/usr/bin/env node

/**
 * Backend API Functionality Test Suite
 * Tests all API endpoints and authentication flows
 */

const http = require('http');
const querystring = require('querystring');

class APITester {
  constructor(baseURL = 'http://localhost:5000') {
    this.baseURL = baseURL;
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
    this.token = null;
    this.testUserId = null;
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

  async makeRequest(method, endpoint, body = null, authToken = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(this.baseURL + endpoint);
      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method: method,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      if (authToken) {
        options.headers['Authorization'] = `Bearer ${authToken}`;
      }

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = data ? JSON.parse(data) : {};
            resolve({
              status: res.statusCode,
              body: parsed,
              headers: res.headers
            });
          } catch (e) {
            resolve({
              status: res.statusCode,
              body: data,
              headers: res.headers
            });
          }
        });
      });

      req.on('error', reject);
      
      if (body) {
        req.write(JSON.stringify(body));
      }
      req.end();
    });
  }

  async testHealthCheck() {
    this.log('title', 'TEST 1: HEALTH CHECK');
    
    try {
      const response = await this.makeRequest('GET', '/health');
      
      if (response.status === 200) {
        this.log('pass', `Health check passed: ${JSON.stringify(response.body)}`);
        this.results.passed++;
      } else {
        this.log('fail', `Health check failed: Status ${response.status}`);
        this.results.failed++;
      }
    } catch (error) {
      this.log('fail', `Health check error: ${error.message}`);
      this.results.failed++;
    }
  }

  async testUserRegistration() {
    this.log('title', 'TEST 2: USER REGISTRATION');

    const testEmail = `test${Date.now()}@example.com`;
    const testData = {
      firstName: 'Test',
      lastName: 'User',
      email: testEmail,
      password: 'TestPassword123'
    };

    try {
      const response = await this.makeRequest('POST', '/api/v1/auth/register', testData);

      if (response.status === 201) {
        this.log('pass', `User registration successful: ${testEmail}`);
        this.results.passed++;
        return testEmail;
      } else {
        this.log('fail', `Registration failed: Status ${response.status}`);
        this.log('info', `Response: ${JSON.stringify(response.body)}`);
        this.results.failed++;
        return null;
      }
    } catch (error) {
      this.log('fail', `Registration error: ${error.message}`);
      this.results.failed++;
      return null;
    }
  }

  async testUserLogin(email, password) {
    this.log('title', 'TEST 3: USER LOGIN');

    const loginData = {
      email: email,
      password: password
    };

    try {
      const response = await this.makeRequest('POST', '/api/v1/auth/login', loginData);

      if (response.status === 200 && response.body.data && response.body.data.token) {
        this.token = response.body.data.token;
        this.log('pass', `Login successful for ${email}`);
        this.log('info', `Token received: ${this.token.substring(0, 20)}...`);
        this.results.passed++;
        return true;
      } else {
        this.log('fail', `Login failed: Status ${response.status}`);
        this.log('info', `Response: ${JSON.stringify(response.body)}`);
        this.results.failed++;
        return false;
      }
    } catch (error) {
      this.log('fail', `Login error: ${error.message}`);
      this.results.failed++;
      return false;
    }
  }

  async testGetProfile() {
    this.log('title', 'TEST 4: GET USER PROFILE');

    if (!this.token) {
      this.log('fail', 'No token available for authenticated request');
      this.results.failed++;
      return;
    }

    try {
      const response = await this.makeRequest('GET', '/api/v1/auth/profile', null, this.token);

      if (response.status === 200 && response.body.success) {
        this.log('pass', `Profile retrieved successfully`);
        this.log('info', `User: ${response.body.data.first_name} ${response.body.data.last_name}`);
        this.results.passed++;
      } else {
        this.log('fail', `Get profile failed: Status ${response.status}`);
        this.results.failed++;
      }
    } catch (error) {
      this.log('fail', `Get profile error: ${error.message}`);
      this.results.failed++;
    }
  }

  async testCreateTask() {
    this.log('title', 'TEST 5: CREATE TASK');

    if (!this.token) {
      this.log('fail', 'No token available for authenticated request');
      this.results.failed++;
      return null;
    }

    const taskData = {
      title: `Test Task ${Date.now()}`,
      description: 'This is a test task for validating the API functionality',
      priority: 'high',
      dueDate: new Date(Date.now() + 86400000).toISOString()
    };

    try {
      const response = await this.makeRequest('POST', '/api/v1/tasks', taskData, this.token);

      if (response.status === 201 && response.body.success) {
        this.log('pass', `Task created successfully: ${taskData.title}`);
        this.log('info', `Task ID: ${response.body.data.id}`);
        this.results.passed++;
        return response.body.data.id;
      } else {
        this.log('fail', `Create task failed: Status ${response.status}`);
        this.log('info', `Response: ${JSON.stringify(response.body)}`);
        this.results.failed++;
        return null;
      }
    } catch (error) {
      this.log('fail', `Create task error: ${error.message}`);
      this.results.failed++;
      return null;
    }
  }

  async testGetTasks() {
    this.log('title', 'TEST 6: GET USER TASKS');

    if (!this.token) {
      this.log('fail', 'No token available for authenticated request');
      this.results.failed++;
      return;
    }

    try {
      const response = await this.makeRequest('GET', '/api/v1/tasks?limit=10&offset=0', null, this.token);

      if (response.status === 200 && response.body.success) {
        this.log('pass', `Tasks retrieved successfully`);
        this.log('info', `Total tasks: ${response.body.data.length}`);
        this.results.passed++;
      } else {
        this.log('fail', `Get tasks failed: Status ${response.status}`);
        this.results.failed++;
      }
    } catch (error) {
      this.log('fail', `Get tasks error: ${error.message}`);
      this.results.failed++;
    }
  }

  async testUpdateTask(taskId) {
    this.log('title', 'TEST 7: UPDATE TASK');

    if (!this.token) {
      this.log('fail', 'No token available for authenticated request');
      this.results.failed++;
      return;
    }

    if (!taskId) {
      this.log('warn', 'No task ID available for update test');
      return;
    }

    const updateData = {
      status: 'completed',
      priority: 'medium'
    };

    try {
      const response = await this.makeRequest('PUT', `/api/v1/tasks/${taskId}`, updateData, this.token);

      if (response.status === 200 && response.body.success) {
        this.log('pass', `Task updated successfully: ID ${taskId}`);
        this.results.passed++;
      } else {
        this.log('fail', `Update task failed: Status ${response.status}`);
        this.results.failed++;
      }
    } catch (error) {
      this.log('fail', `Update task error: ${error.message}`);
      this.results.failed++;
    }
  }

  async testDeleteTask(taskId) {
    this.log('title', 'TEST 8: DELETE TASK');

    if (!this.token) {
      this.log('fail', 'No token available for authenticated request');
      this.results.failed++;
      return;
    }

    if (!taskId) {
      this.log('warn', 'No task ID available for delete test');
      return;
    }

    try {
      const response = await this.makeRequest('DELETE', `/api/v1/tasks/${taskId}`, null, this.token);

      if (response.status === 200 && response.body.success) {
        this.log('pass', `Task deleted successfully: ID ${taskId}`);
        this.results.passed++;
      } else {
        this.log('fail', `Delete task failed: Status ${response.status}`);
        this.results.failed++;
      }
    } catch (error) {
      this.log('fail', `Delete task error: ${error.message}`);
      this.results.failed++;
    }
  }

  async testUnauthorizedAccess() {
    this.log('title', 'TEST 9: UNAUTHORIZED ACCESS (NEGATIVE TEST)');

    try {
      const response = await this.makeRequest('GET', '/api/v1/tasks');

      if (response.status === 401) {
        this.log('pass', `Unauthorized access properly blocked: Status 401`);
        this.results.passed++;
      } else {
        this.log('fail', `Unauthorized access not blocked: Status ${response.status}`);
        this.results.failed++;
      }
    } catch (error) {
      this.log('fail', `Unauthorized test error: ${error.message}`);
      this.results.failed++;
    }
  }

  async testInvalidCredentials() {
    this.log('title', 'TEST 10: INVALID CREDENTIALS (NEGATIVE TEST)');

    const invalidData = {
      email: 'nonexistent@example.com',
      password: 'WrongPassword123'
    };

    try {
      const response = await this.makeRequest('POST', '/api/v1/auth/login', invalidData);

      if (response.status === 401) {
        this.log('pass', `Invalid credentials properly rejected: Status 401`);
        this.results.passed++;
      } else {
        this.log('fail', `Invalid credentials not rejected: Status ${response.status}`);
        this.results.failed++;
      }
    } catch (error) {
      this.log('fail', `Invalid credentials test error: ${error.message}`);
      this.results.failed++;
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
    console.log(`${colors.bold}API FUNCTIONALITY TEST REPORT${colors.reset}`);
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

  async runAllTests() {
    console.log(`\n${colors.bold}${colors.cyan}╔════════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.bold}${colors.cyan}║   API FUNCTIONALITY TESTING                            ║${colors.reset}`);
    console.log(`${colors.bold}${colors.cyan}║   Testing all endpoints and authentication flows       ║${colors.reset}`);
    console.log(`${colors.bold}${colors.cyan}╚════════════════════════════════════════════════════════╝${colors.reset}\n`);

    this.log('info', `Testing API at: ${this.baseURL}`);
    this.log('info', 'Waiting 2 seconds for backend to be ready...\n');

    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      // Health check
      await this.testHealthCheck();
      
      // Authentication tests
      const email = await this.testUserRegistration();
      if (email) {
        await this.testUserLogin(email, 'TestPassword123');
      }

      // Authorized tests
      await this.testGetProfile();
      const taskId = await this.testCreateTask();
      await this.testGetTasks();
      if (taskId) {
        await this.testUpdateTask(taskId);
        await this.testDeleteTask(taskId);
      }

      // Negative tests
      await this.testUnauthorizedAccess();
      await this.testInvalidCredentials();

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
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

// Run API tests
const tester = new APITester();
tester.runAllTests().then(report => {
  process.exit(report.success ? 0 : 1);
});
