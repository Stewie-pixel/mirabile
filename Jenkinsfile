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
                powershell 'docker build -t $env:IMAGE_NAME`:$env:BUILD_NUMBER .'
                powershell 'docker tag $env:IMAGE_NAME`:$env:BUILD_NUMBER $env:IMAGE_NAME`:latest'
            }
        }

        // 2. TEST
        stage('Test') {
            steps {
                echo 'Starting application for testing...'
                powershell 'docker run -d --name mirabile-test-server -p 8095:80 $env:IMAGE_NAME`:$env:BUILD_NUMBER'
                sleep(time: 3, unit: 'SECONDS')
                echo 'Running Selenium tests...'
                powershell '''
                    $files = Get-ChildItem -Path tests -Filter *.side -Recurse | Select-Object -ExpandProperty FullName
                    if ($files) {
                        npx selenium-side-runner --base-url http://localhost:8095 $files --output-directory test-results
                    } else {
                        Write-Host "No .side files found in tests directory"
                    }
                '''
                powershell '''
                    $jsonFiles = Get-ChildItem -Path test-results -Filter *.json -Recurse
                    $xml = "<?xml version=`"1.0`" encoding=`"UTF-8`"?>`n<testsuites>"
                    foreach ($file in $jsonFiles) {
                        $data = Get-Content $file.FullName | ConvertFrom-Json
                        foreach ($suite in $data.testResults) {
                            $suiteName = $suite.testFilePath
                            $xml += "`n<testsuite name=`"$suiteName`">"
                            foreach ($test in $suite.testResults) {
                                $name = $test.fullName
                                $time = $test.duration / 1000
                                if ($test.status -eq "passed") {
                                    $xml += "`n<testcase name=`"$name`" time=`"$time`"/>"
                                } else {
                                    $xml += "`n<testcase name=`"$name`" time=`"$time`"><failure>$($test.failureMessages -join "`n")</failure></testcase>"
                                }
                            }
                            $xml += "`n</testsuite>"
                        }
                    }
                    $xml += "`n</testsuites>"
                    $xml | Out-File -FilePath "test-results/junit.xml" -Encoding UTF8
                    Write-Host "JUnit XML generated at test-results/junit.xml"
                '''
            }
            post {
                always {
                    powershell 'docker stop mirabile-test-server; exit 0'
                    powershell 'docker rm mirabile-test-server; exit 0'
                    junit allowEmptyResults: true, testResults: 'test-results/junit.xml'
                }
            }
        }

        // 3. CODE QUALITY
        stage('Code Quality') {
            steps {
                echo 'Running SonarQube analysis...'
                withSonarQubeEnv('SonarQube') {
                    powershell 'D:\\Packages\\sonar-scanner-8.0.1.6346-windows-x64\\bin\\sonar-scanner.bat -Dsonar.projectKey=$env:SONAR_PROJECT_KEY -Dsonar.projectName=Mirabile -Dsonar.sources=src -Dsonar.exclusions=**/node_modules/**,**/dist/**'
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
                powershell 'dependency-check.bat --project "Mirabile" --scan . --exclude "**/node_modules/**" --format HTML --format XML --out reports/dependency-check'
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
                powershell 'docker-compose -f docker-compose.staging.yml down; exit 0'
                powershell 'docker-compose -f docker-compose.staging.yml up -d'
                echo 'Waiting for staging to be healthy...'
                sleep(time: 10, unit: 'SECONDS')
                powershell 'curl -f http://localhost:$env:STAGING_PORT'
            }
        }

        // 6. RELEASE (Production)
        stage('Release') {
            steps {
                echo 'Promoting to production...'
                input message: 'Deploy to production?', ok: 'Release'
                powershell 'docker stop $env:PROD_CONTAINER; exit 0'
                powershell 'docker rm $env:PROD_CONTAINER; exit 0'
                powershell 'docker run -d --name $env:PROD_CONTAINER --restart unless-stopped -p $env:PROD_PORT`:80 $env:IMAGE_NAME`:$env:BUILD_NUMBER'
            }
        }

        // 7. MONITORING
        stage('Monitoring') {
            steps {
                echo 'Registering deployment with Datadog...'
                powershell '''
                    $body = @{
                        title      = "Mirabile deployed to production"
                        text       = "Build #$env:BUILD_NUMBER deployed successfully."
                        priority   = "normal"
                        tags       = @("env:production", "app:mirabile")
                        alert_type = "info"
                    } | ConvertTo-Json

                    Invoke-RestMethod -Uri "https://api.datadoghq.com/api/v1/events" -Method Post -Headers @{ "DD-API-KEY" = "$env:DD_API_KEY"; "Content-Type" = "application/json" } -Body $body
                '''
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully.'
        }
        failure {
            echo 'Pipeline failed.'
            powershell '''
                $body = @{
                    title      = "Mirabile pipeline FAILED"
                    text       = "Build #$env:BUILD_NUMBER failed. Check Jenkins logs."
                    priority   = "high"
                    tags       = @("env:production", "app:mirabile")
                    alert_type = "error"
                } | ConvertTo-Json

                Invoke-RestMethod -Uri "https://api.datadoghq.com/api/v1/events" -Method Post -Headers @{ "DD-API-KEY" = "$env:DD_API_KEY"; "Content-Type" = "application/json" } -Body $body
            '''
        }
    }
}