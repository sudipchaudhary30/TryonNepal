dev:
	docker compose -f docker/docker-compose.yml up --build

down:
	docker compose -f docker/docker-compose.yml down

logs:
	docker compose -f docker/docker-compose.yml logs -f

fe:
	cd frontend && npm run dev

be:
	cd backend && uvicorn app.main:app --reload

test:
	cd frontend && npm run test && cd ../backend && pytest

clean:
	docker compose -f docker/docker-compose.yml down -v
