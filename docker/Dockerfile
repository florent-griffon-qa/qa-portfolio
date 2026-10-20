# Test runner image: Node, Playwright browsers and OS deps come from the official
# Playwright image, pinned by digest. Newman and its reporter come from package-lock.json.
# The CI e2e job runs in this same base image, so local and CI results match.
FROM mcr.microsoft.com/playwright:v1.64.1-noble@sha256:7852dc5a7d72f5fe458a597d690f6c42fbc8e9e26ddfa95f8e6ef552558d9bbf

WORKDIR /work
RUN chown pwuser:pwuser /work
USER pwuser

# Dependencies first: this layer is reused while package-lock.json does not change.
# --ignore-scripts skips the Husky "prepare" hook (no .git inside the image).
COPY --chown=pwuser:pwuser package.json package-lock.json ./
RUN npm ci --ignore-scripts

COPY --chown=pwuser:pwuser . .
