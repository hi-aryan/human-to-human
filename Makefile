# ============================================
# Docker Development Commands
# ============================================

.PHONY: build up down restart logs shell clean prune

# Build the Docker image
build:
	docker compose build

# Start the dev container (with build if needed)
up:
	docker compose up --build

# Start in detached mode
up-d:
	docker compose up -d --build

# Stop the container
down:
	docker compose down

# Restart the container
restart:
	docker compose down && docker compose up --build

# View container logs
logs:
	docker compose logs -f

# Open a shell inside the running container
shell:
	docker compose exec app sh

# Remove containers, networks, and volumes
clean:
	docker compose down -v --remove-orphans

# Remove all unused Docker resources (use with caution)
prune:
	docker system prune -f

# Install new npm packages (rebuilds node_modules volume)
install:
	docker compose down -v
	docker compose up --build

# Run a one-off npm command inside the container
npm:
	docker compose exec app npm $(filter-out $@,$(MAKECMDGOALS))

# Prevent make from treating arguments as targets
%:
	@:
