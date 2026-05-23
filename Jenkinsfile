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
        stage('Build') {
            steps {
                echo 'Building Docker image...'
                powershell "docker build -t ${env.IMAGE_NAME}:${env.BUILD_NUMBER} ."
                powershell "docker tag ${env.IMAGE_NAME}:${env.BUILD_NUMBER} ${env.IMAGE_NAME}:latest"
            }
        }

        stage('Test') {
            steps {
                echo 'Starting application for testing...'
                powershell "docker run -d --name mirabile-test-server -p 8095:80 ${env.IMAGE_NAME}:${env.BUILD_NUMBER}"
                sleep(time: 3, unit: 'SECONDS')
                
                echo 'Running Selenium tests...'
                powershell '''
                    $files = Get-ChildItem -Path tests -Filter *.side -Recurse | Select-Object -ExpandProperty FullName
                    if ($files) {
                        npx --yes selenium-side-runner --base-url http://localhost:8095 $files --output-directory test-results
                    } else {
                        Write-Host "No .side files found in tests directory"
                    }
                '''
            }
            post {
                always {
                    powershell "docker stop mirabile-test-server; exit 0"
                    powershell "docker rm mirabile-test-server; exit 0"
                    junit allowEmptyResults: true, testResults: 'test-results/junit.xml'
                }
            }
        }

        stage('Code Quality') {
            steps {
                echo 'Running SonarQube analysis...'
                withSonarQubeEnv('SonarQube') {
                    powershell "& 'D:\\Packages\\sonar-scanner-8.0.1.6346-windows-x64\\bin\\sonar-scanner.bat' -Dsonar.projectKey=${env.SONAR_PROJECT_KEY} -Dsonar.projectName=Mirabile -Dsonar.sources=src -Dsonar.exclusions=**/node_modules/**,**/dist/**"
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

        stage('Security') {
            steps {
                echo 'Running OWASP Dependency-Check...'
                powershell "dependency-check.bat --project \"Mirabile\" --scan . --exclude \"**/node_modules/**\" --format HTML --format XML --out reports/dependency-check"
            }
            post {
                always {
                    dependencyCheckPublisher pattern: 'reports/dependency-check/dependency-check-report.xml'
                }
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying to staging...'
                powershell "docker-compose -f docker-compose.staging.yml down; exit 0"
                powershell "docker-compose -f docker-compose.staging.yml up -d"
                
                echo 'Waiting for staging to be healthy...'
                sleep(time: 10, unit: 'SECONDS')
                powershell "curl.exe -f http://localhost:${env.STAGING_PORT}"
            }
        }

        stage('Release') {
            steps {
                echo 'Promoting to production...'
                input message: 'Deploy to production?', ok: 'Release'
                
                powershell "docker stop ${env.PROD_CONTAINER}; exit 0"
                powershell "docker rm ${env.PROD_CONTAINER}; exit 0"
                powershell "docker run -d --name ${env.PROD_CONTAINER} --restart unless-stopped -p ${env.PROD_PORT}:80 ${env.IMAGE_NAME}:${env.BUILD_NUMBER}"
            }
        }

        stage('Monitoring') {
            steps {
                echo 'Registering deployment with Datadog...'
                sendDatadogEvent("Mirabile deployed to production", "Build #${env.BUILD_NUMBER} deployed successfully.", "info")
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully.'
        }
        failure {
            echo 'Pipeline failed.'
            sendDatadogEvent("Mirabile pipeline FAILED", "Build #${env.BUILD_NUMBER} failed. Check Jenkins logs.", "error")
        }
    }
}

def sendDatadogEvent(title, text, alertType) {
    powershell """
        \\$body = @{
            title      = "${title}"
            text       = "${text}"
            priority   = "normal"
            tags       = @("env:production", "app:mirabile")
            alert_type = "${alertType}"
        } | ConvertTo-Json

        Invoke-RestMethod -Uri "https://api.datadoghq.com/api/v1/events" -Method Post -Headers @{ "DD-API-KEY" = "${env.DD_API_KEY}"; "Content-Type" = "application/json" } -Body \\$body
    """
}