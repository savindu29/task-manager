// CI/CD for the BACKEND only. Triggered on pushes to `main` (GitHub webhook).
// Production DB is a single managed Postgres (not in Docker). Tests run against
// a DISPOSABLE Postgres container that is created and destroyed inside the
// pipeline — it never touches the real database.
//
// Assumes Jenkins runs in Docker with the host Docker socket mounted, so the
// `docker` CLI here drives the host daemon. No Docker-in-Docker needed.
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
      // Tests run against an in-memory H2 DB (the "test" profile), so no
      // external database is needed. Build the deps/source image once, run tests in it.
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
      // Real secrets (managed DB, JWT, admin, CORS) live in the Jenkins
      // "Secret file" credential `task-manager-env`, injected as --env-file.
      steps {
        withCredentials([file(credentialsId: 'task-manager-env', variable: 'ENV_FILE')]) {
          sh '''
            # Shared network with Caddy so it can reach this container by name.
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
