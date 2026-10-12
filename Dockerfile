# Dev toolchain only. Source is bind-mounted; node_modules lives in a named volume.
FROM node:22-bookworm-slim
WORKDIR /app
ENV ASTRO_TELEMETRY_DISABLED=1 \
    DOCKER=1
EXPOSE 4321
CMD ["npm", "run", "dev"]
