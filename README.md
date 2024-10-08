# Matter.js SVG Physics Simulation

This project is a physics simulation using Matter.js to render and animate complex SVG shapes. The project allows SVG shapes to interact with physics constraints, such as gravity, walls, and collisions, within a React environment.

## Features

- **SVG Shape Physics**: Convert SVG paths into physics bodies that interact with walls, gravity, and each other.
- **Physics Engine**: Powered by Matter.js, enabling real-time physics-based simulation.
- **Mouse Interaction**: Users can drag and move objects within the simulation using a mouse control interface.
- **Responsive Design**: The physics simulation adapts to the container's size.

## Technologies Used

- **React**: UI framework for building the user interface.
- **Matter.js**: 2D physics engine for running the physics simulation.
- **TypeScript**: For static typing and better developer experience.
- **SVGs**: Complex shapes for use in the simulation.
- **poly-decomp**: Library for breaking down complex polygons into simpler convex shapes for physics calculations.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/matterjs-svg-physics.git
   ```

2. Navigate to the project directory:

   ```bash
   cd matterjs-svg-physics
   ```

3. Install the dependencies:

   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm start
   ```

The project should now be running on `http://localhost:3000`.

## How It Works

- **Engine Setup**: The Matter.js engine and renderer are initialized in the `useEffect` hook. Walls and ground are created as static bodies to contain the SVG shapes.
- **SVG Paths**: The paths defined in the `<svg>` tags are converted into physics bodies using Matter.js’ `Svg.pathToVertices()` method.
- **Mouse Interaction**: Users can interact with the SVG shapes by dragging them within the canvas, enabled by Matter.js' `MouseConstraint`.

## File Overview

- **src/App.tsx**: Main React component that initializes Matter.js, sets up the physics engine, renders the SVG shapes, and handles mouse interactions.
- **pathseg**: A polyfill for better handling of SVG paths in the browser.

## Key Variables

- `THICCNESS`: Determines the thickness of the walls and ground in the simulation.
- `SVG_WIDTH_IN_PX`: The base width of the SVG element.
- `SVG_WIDTH_AS_PERCENT_OF_CONTAINER_WIDTH`: Defines how large the SVG should be relative to the container size.

## Customization

To change the SVG shapes or add new ones, modify the SVG elements inside the `#svgs` div in the `App.tsx` file. Each `<path>` element with the `id="matter-path"` will be converted into a physics body.

## License

This project is open-source and available under the [MIT License](LICENSE).

---
