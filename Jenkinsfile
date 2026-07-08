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
    // Names for the throwaway test resources.
    TEST_DB = 'tm-test-db'
    TEST_NET = 'tm-test-net'
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Test') {
      steps {
        sh '''
          # Fresh, disposable Postgres just for this test run.
          docker rm -f $TEST_DB 2>/dev/null || true
          docker network create $TEST_NET 2>/dev/null || true
          docker run -d --name $TEST_DB --network $TEST_NET \
            -e POSTGRES_DB=taskmanager_test \
            -e POSTGRES_USER=test \
            -e POSTGRES_PASSWORD=test \
            postgres:16

          # Wait until it accepts connections.
          for i in $(seq 1 30); do
            docker exec $TEST_DB pg_isready -U test -d taskmanager_test && break
            sleep 2
          done

          # Build the (source + deps) image and run the tests against the temp DB.
          docker build --target build -t $IMAGE:build ./task-manager-backend
          docker run --rm --network $TEST_NET \
            -e DB_URL=jdbc:postgresql://$TEST_DB:5432/taskmanager_test \
            -e DB_USERNAME=test \
            -e DB_PASSWORD=test \
            -e JWT_SECRET=dGVzdC1qd3Qtc2VjcmV0LXRlc3Qtand0LXNlY3JldC0xMjM0NTY3OA== \
            -e ADMIN_PASSWORD=test12345 \
            $IMAGE:build mvn -B -ntp test
        '''
      }
      post {
        always {
          // Always tear down the disposable DB + network.
          sh '''
            docker rm -f $TEST_DB 2>/dev/null || true
            docker network rm $TEST_NET 2>/dev/null || true
          '''
        }
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
            docker rm -f $CONTAINER 2>/dev/null || true
            docker run -d --name $CONTAINER --restart unless-stopped \
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
