pipeline {
    agent any

    environment {
        IMAGE_NAME        = 'mirabile'
        STAGING_CONTAINER = 'mirabile-staging'
        PROD_CONTAINER    = 'mirabile-prod'
        STAGING_PORT      = '3001'
        PROD_PORT         = '3000'
        SONAR_PROJECT_KEY = 'mirabile'
        DD_API_KEY        = credentials('datadog-api-key')
    }

    stages {

        // 1. BUILD
        stage('Build') {
            steps {
                echo 'Building Docker image...'
                bat 'docker build -t %IMAGE_NAME%:%BUILD_NUMBER% .'
                bat 'docker tag %IMAGE_NAME%:%BUILD_NUMBER% %IMAGE_NAME%:latest'
            }
        }

        // 2. TEST
        stage('Test') {
            steps {
                echo 'Starting application for testing...'

                bat 'docker run -d --name mirabile-test-server -p 8095:80 %IMAGE_NAME%:%BUILD_NUMBER%'
                
                sleep(time: 3, unit: 'SECONDS')

                echo 'Running Selenium tests...'

                bat 'npx selenium-side-runner --base-url http://localhost:8095 tests/'
            }
            post {
                always {
                    bat 'docker stop mirabile-test-server || exit /b 0'
                    bat 'docker rm mirabile-test-server || exit /b 0'
                    
                    junit allowEmptyResults: true, testResults: 'test-results/**/*.xml'
                }
            }
        }

        // 3. CODE QUALITY
        stage('Code Quality') {
            steps {
                echo 'Running SonarQube analysis...'
                withSonarQubeEnv('SonarQube') {
                    bat 'sonar-scanner -Dsonar.projectKey=%SONAR_PROJECT_KEY% -Dsonar.projectName=Mirabile -Dsonar.sources=src -Dsonar.exclusions=**/node_modules/**,**/dist/**'
                }
            }
        }

        stage('Quality Gate') {
            steps {
                echo 'Waiting for SonarQube quality gate...'
                timeout(time: 2, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        // 4. SECURITY
        stage('Security') {
            steps {
                echo 'Running OWASP Dependency-Check...'
                bat 'dependency-check.bat --project "Mirabile" --scan . --exclude "**/node_modules/**" --format HTML --format XML --out reports/dependency-check'
            }
            post {
                always {
                    dependencyCheckPublisher pattern: 'reports/dependency-check/dependency-check-report.xml'
                }
            }
        }

        // 5. DEPLOY
        stage('Deploy') {
            steps {
                echo 'Deploying to staging...'
                bat 'docker-compose -f docker-compose.staging.yml down || exit /b 0'
                bat 'docker-compose -f docker-compose.staging.yml up -d'
                echo 'Waiting for staging to be healthy...'
                sleep(time: 10, unit: 'SECONDS')
                bat 'curl -f http://localhost:%STAGING_PORT% || exit /b 1'
            }
        }

        // 6. RELEASE (Production)
        stage('Release') {
            steps {
                echo 'Promoting to production...'
                input message: 'Deploy to production?', ok: 'Release'
                bat 'docker stop %PROD_CONTAINER% || exit /b 0'
                bat 'docker rm %PROD_CONTAINER% || exit /b 0'
                bat 'docker run -d --name %PROD_CONTAINER% --restart unless-stopped -p %PROD_PORT%:80 %IMAGE_NAME%:%BUILD_NUMBER%'
            }
        }

        // 7. MONITORING
        stage('Monitoring') {
            steps {
                echo 'Registering deployment with Datadog...'
                bat 'curl -X POST "https://api.datadoghq.com/api/v1/events" -H "Content-Type: application/json" -H "DD-API-KEY: %DD_API_KEY%" -d "{\"title\": \"Mirabile deployed to production\", \"text\": \"Build #%BUILD_NUMBER% deployed successfully.\", \"priority\": \"normal\", \"tags\": [\"env:production\", \"app:mirabile\"], \"alert_type\": \"info\"}"'
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully.'
        }
        failure {
            echo 'Pipeline failed.'
            bat 'curl -X POST "https://api.datadoghq.com/api/v1/events" -H "Content-Type: application/json" -H "DD-API-KEY: %DD_API_KEY%" -d "{\"title\": \"Mirabile pipeline FAILED\", \"text\": \"Build #%BUILD_NUMBER% failed. Check Jenkins logs.\", \"priority\": \"high\", \"tags\": [\"env:production\", \"app:mirabile\"], \"alert_type\": \"error\"}"'
        }
    }
}