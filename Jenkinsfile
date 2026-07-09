// CI/CD for the BACKEND only. Triggered on pushes to `main`.
pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
    timeout(time: 20, unit: 'MINUTES')
  }

  environment {
    IMAGE = 'task-manager-backend'
    CONTAINER = 'task-manager-backend'
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Test') {
      // Run tests in the build image (H2 "test" profile, no external DB).
      steps {
        sh '''
          docker build --target build -t $IMAGE:build ./task-manager-backend
          docker run --rm $IMAGE:build mvn -B -ntp test
        '''
      }
    }

    stage('Build image') {
      steps {
        sh 'docker build -t $IMAGE:$BUILD_NUMBER -t $IMAGE:latest ./task-manager-backend'
      }
    }

    stage('Deploy') {
      // Secrets live in the Jenkins "Secret file" credential, injected as --env-file.
      steps {
        withCredentials([file(credentialsId: 'task-manager-env', variable: 'ENV_FILE')]) {
          sh '''
            docker network create web 2>/dev/null || true
            docker rm -f $CONTAINER 2>/dev/null || true
            docker run -d --name $CONTAINER --network web --restart unless-stopped \
              --env-file "$ENV_FILE" \
              -p 8081:5000 \
              $IMAGE:latest
          '''
        }
      }
    }
  }

  post {
    success { echo 'Backend deployed from main.' }
    always  { sh 'docker image prune -f || true' }
  }
}
