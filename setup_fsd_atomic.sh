#!/usr/bin/env bash

# ==============================================================================
# FSD (Feature-Sliced Design) + Atomic Design Bootstrap Script
# ==============================================================================
# This script initializes a fully structured FSD directory tree with an Atomic
# Design setup (Atoms & Molecules) inside the Shared UI segment.
# Supports React, React Native, and Expo projects out-of-the-box.
# ==============================================================================

# Text formatting helper constants
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "${BLUE}${BOLD}======================================================================${NC}"
echo -e "${BLUE}${BOLD}   FSD + Atomic Design Boilerplate Initializer${NC}"
echo -e "${BLUE}${BOLD}======================================================================${NC}"

# Target directory is the current working directory, or a subfolder if provided
TARGET_DIR="src"
if [ ! -d "$TARGET_DIR" ]; then
    echo -e "${YELLOW}Creating '$TARGET_DIR' directory...${NC}"
    mkdir -p "$TARGET_DIR"
fi

# Define FSD structure with Atomic shared/ui
directories=(
    "src/app/navigation"
    "src/pages"
    "src/widgets"
    "src/features"
    "src/entities"
    "src/shared/ui/atoms"
    "src/shared/ui/molecules"
    "src/shared/lib/hooks"
    "src/shared/lib/context"
    "src/shared/lib/utils"
    "src/shared/constants"
)

echo -e "\n${YELLOW}Building FSD layers and Atomic shared UI segments...${NC}"

# Create directories
for dir in "${directories[@]}"; do
    mkdir -p "$dir"
    echo -e "  ${GREEN}✓${NC} Created directory: $dir"
done

# Initialize shared/ui barrel files
echo -e "\n${YELLOW}Initializing Barrel Exports (index.ts) for shared/ui...${NC}"

# 1. Atoms barrel
cat << 'EOF' > src/shared/ui/atoms/index.ts
// ==============================================================================
// Atoms (Indivisible fundamental components)
// ==============================================================================
// Export your atomic components here. Example:
// export { Button } from './Button';
EOF
echo -e "  ${GREEN}✓${NC} Created: src/shared/ui/atoms/index.ts"

# 2. Molecules barrel
cat << 'EOF' > src/shared/ui/molecules/index.ts
// ==============================================================================
// Molecules (Simple combinations of Atoms)
// ==============================================================================
// Export your molecular components here. Example:
// export { Header } from './Header';
EOF
echo -e "  ${GREEN}✓${NC} Created: src/shared/ui/molecules/index.ts"

# 3. Public API barrel
cat << 'EOF' > src/shared/ui/index.ts
// ==============================================================================
// Public API for Shared UI Segment (FSD Barrel)
// ==============================================================================
export * from './atoms';
export * from './molecules';
EOF
echo -e "  ${GREEN}✓${NC} Created: src/shared/ui/index.ts"

# Setup documentation guide inside src/README.md
cat << 'EOF' > src/README.md
# Feature-Sliced Design (FSD) + Atomic UI Structure

This project uses the **Feature-Sliced Design (FSD)** architecture integrated with **Atomic Design** in the `shared/ui` layer.

## 📂 Folder Structure Guide

- **`app/`**: Application-wide setups (providers, navigation configs, global styles).
- **`pages/`**: Full screens/layouts composed of widgets and features.
- **`widgets/`**: Self-contained, multi-component page sections (e.g., Header + Sidebar combinations).
- **`features/`**: User-centric business capabilities and actions (e.g., `add-to-cart`, `play-audio`).
- **`entities/`**: Domain concepts and data models (e.g., `user`, `product`, `playlist` stores).
- **`shared/`**: Generic, reusable infrastructural tools and UI.
  - **`shared/ui/`**: Deconstructed using Atomic Design:
    - **`atoms/`**: Basic, indivisible elements (`Button`, `Switch`, `Input`).
    - **`molecules/`**: Simple composite components combining atoms (`Header`, `Slider`).
    - **`index.ts`**: The segment's Public API. Always import via `@/shared/ui` rather than deep paths.

## ⚙️ Path Alias Configurations

To enable clean absolute imports (e.g., `@/shared/ui`), apply these configurations:

### 1. `tsconfig.json` or `jsconfig.json`
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### 2. Expo / React Native (`babel.config.js` with module-resolver)
Install the plugin: `npm install --save-dev babel-plugin-module-resolver`
```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
          },
        },
      ],
    ],
  };
};
```
EOF
echo -e "  ${GREEN}✓${NC} Created: src/README.md documentation guide."

echo -e "\n${GREEN}${BOLD}======================================================================${NC}"
echo -e "${GREEN}${BOLD}   Initialization Completed Successfully!${NC}"
echo -e "${GREEN}${BOLD}======================================================================${NC}"
echo -e "Your project has been bootstrapped with a scalable architectural framework."
echo -e "Review ${BLUE}src/README.md${NC} for configuration details and guidelines."
echo -e "${GREEN}${BOLD}======================================================================${NC}\n"
