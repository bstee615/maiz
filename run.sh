podman build -t maiz-server .
podman build -t maiz-mazedraw mazedraw

podman pod rm maiz -f
podman pod create --name maiz -p 8000
podman run -d --pod maiz maiz-server
podman run -d --pod maiz maiz-mazedraw