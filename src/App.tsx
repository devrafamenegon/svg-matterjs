// src/App.tsx

import React, { useEffect, useRef } from "react";
import Matter, {
  Bodies,
  Composite,
  Engine,
  Render,
  Runner,
  Svg,
  Vertices,
  Mouse,
  MouseConstraint,
  Body,
  Vector,
} from "matter-js";

import "pathseg"; // Para suporte ao Path de SVG

// @ts-ignore
import decomp from "poly-decomp";
(window as any).decomp = decomp; // Necessário para Matter.js trabalhar com polígonos complexos

const THICCNESS = 60;
const SVG_WIDTH_IN_PX = 300;
const SVG_WIDTH_AS_PERCENT_OF_CONTAINER_WIDTH = 0.3;

const MatterScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);

  // Inicializa o Matter.js quando o componente monta
  useEffect(() => {
    const matterContainer = containerRef.current;
    if (!matterContainer) return;

    const engine = Engine.create();
    engineRef.current = engine;

    const render = Render.create({
      element: matterContainer,
      engine: engine,
      options: {
        width: matterContainer.clientWidth,
        height: matterContainer.clientHeight,
        background: "transparent",
        wireframes: false,
        showAngleIndicator: false,
      },
    });
    renderRef.current = render;

    // Cria o chão e as paredes
    const ground = Bodies.rectangle(
      matterContainer.clientWidth / 2,
      matterContainer.clientHeight + THICCNESS / 2,
      27184,
      THICCNESS,
      { isStatic: true }
    );

    const leftWall = Bodies.rectangle(
      0 - THICCNESS / 2,
      matterContainer.clientHeight / 2,
      THICCNESS,
      matterContainer.clientHeight * 5,
      { isStatic: true }
    );

    const rightWall = Bodies.rectangle(
      matterContainer.clientWidth + THICCNESS / 2,
      matterContainer.clientHeight / 2,
      THICCNESS,
      matterContainer.clientHeight * 5,
      { isStatic: true }
    );

    Composite.add(engine.world, [ground, leftWall, rightWall]);

    // Adiciona as formas SVG
    createSvgBodies(matterContainer, engine);

    // Adiciona o controle de mouse
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.1,
        damping: 1,
        render: { visible: false },
      },
    });
    Composite.add(engine.world, mouseConstraint);

    Render.run(render);

    const runner = Runner.create();
    Runner.run(runner, engine);

    // Redimensiona conforme a tela muda de tamanho
    const handleResize = () =>
      resizeEngine(engine, matterContainer, ground, rightWall);
    window.addEventListener("resize", handleResize);

    // Limpa o evento e destrói a simulação ao desmontar o componente
    return () => {
      window.removeEventListener("resize", handleResize);
      Render.stop(render);
      Engine.clear(engine);
      Render.lookAt(render, { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } });
      render.canvas.remove();
    };
  }, []);

  const createSvgBodies = (
    matterContainer: HTMLDivElement,
    engine: Matter.Engine
  ) => {
    const paths = document.querySelectorAll<SVGPathElement>("#matter-path");

    paths.forEach((path, index) => {
      let scaleFactor =
        (matterContainer.clientWidth *
          SVG_WIDTH_AS_PERCENT_OF_CONTAINER_WIDTH) /
        SVG_WIDTH_IN_PX;

      let vertices = Svg.pathToVertices(path, 4);
      const centerPoint = Matter.Vertices.centre(vertices);
      vertices = Vertices.scale(
        vertices,
        scaleFactor,
        scaleFactor,
        centerPoint
      );

      let svgBody = Bodies.fromVertices(100 + index * 150, 800, [vertices], {
        friction: 0.00001,
        frictionAir: 0.00001,
        restitution: 0.2,
        render: {
          visible: true,
          fillStyle: "#2A3E98",
          lineWidth: 1,
          strokeStyle: "#2A3E98",
        },
      });

      Composite.add(engine.world, svgBody);
    });
  };

  const resizeEngine = (
    engine: Matter.Engine,
    matterContainer: HTMLDivElement,
    ground: Matter.Body,
    rightWall: Matter.Body
  ) => {
    if (!renderRef.current) return;

    const render = renderRef.current;
    render.canvas.width = matterContainer.clientWidth;
    render.canvas.height = matterContainer.clientHeight;

    Body.setPosition(
      ground,
      Vector.create(
        matterContainer.clientWidth / 2,
        matterContainer.clientHeight + THICCNESS / 2
      )
    );

    Body.setPosition(
      rightWall,
      Vector.create(
        matterContainer.clientWidth + THICCNESS / 2,
        matterContainer.clientHeight / 2
      )
    );
  };

  return (
    <div>
      <div id="svgs" style={{ display: "none" }}>
        <svg
          width="102"
          height="87"
          viewBox="0 0 102 87"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            id="matter-path"
            d="M17.5692 0.876949L35.3436 14.5652C35.3436 14.5652 21.4509 27.4363 21.4509 43.7805C21.4509 53.7913 24.3112 62.1677 30.236 62.1677C36.5694 62.1677 37.7952 57.6731 40.8598 42.9633C44.9458 23.7588 53.118 7.00603 71.5053 7.00603C86.6237 7.00603 101.742 22.1244 101.742 48.6838C101.742 70.5442 89.8926 85.0496 89.8926 85.0496L71.9139 72.7915C71.9139 72.7915 80.2903 61.7591 80.2903 48.6838C80.2903 39.4902 77.0215 31.1137 71.0967 31.1137C65.1719 31.1137 63.7417 37.6514 60.2686 53.9956C56.1825 73.2001 49.8491 86.8884 29.8274 86.8884C13.2788 86.8884 -0.000918519 69.3183 -0.000917438 44.5977C-0.000916197 16.1996 17.5692 0.876949 17.5692 0.876949Z"
            fill="black"
          />
        </svg>

        <svg
          width="103"
          height="102"
          viewBox="0 0 103 102"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            id="matter-path"
            d="M51.6127 0.147217C41.5515 0.147217 31.7162 3.13073 23.3506 8.72048C14.985 14.3102 8.46475 22.2551 4.61448 31.5506C0.764206 40.846 -0.2432 51.0744 1.71965 60.9423C3.6825 70.8103 8.52745 79.8746 15.6418 86.989C22.7562 94.1034 31.8205 98.9483 41.6884 100.911C51.5563 102.874 61.7847 101.867 71.08 98.0164C80.3754 94.1661 88.3203 87.6459 93.91 79.2802C99.4997 70.9146 102.483 61.0792 102.483 51.0179H79.5078C79.5078 56.5351 77.8718 61.9283 74.8066 66.5157C71.7415 71.103 67.3849 74.6784 62.2877 76.7897C57.1905 78.9011 51.5818 79.4535 46.1707 78.3771C40.7595 77.3008 35.7891 74.644 31.8879 70.7428C27.9867 66.8416 25.33 61.8712 24.2536 56.46C23.1773 51.0489 23.7297 45.4401 25.841 40.3429C27.9523 35.2457 31.5277 30.8891 36.115 27.8239C40.7024 24.7588 46.0956 23.1227 51.6127 23.1227V0.147217Z"
            fill="black"
          />
          <path
            id="matter-path"
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M72.0188 32.0224C68.1207 27.8311 63.0469 24.9599 57.5026 23.758L62.3573 1.30467C60.4514 0.892591 58.5245 0.59065 56.5859 0.399994L56.5864 0.39502C63.0418 1.0318 69.2592 2.89056 74.9301 5.81837L64.3968 26.2314C65.9555 27.0357 67.4349 27.9852 68.8153 29.0674L82.9858 10.9912C85.0641 12.6212 87.0236 14.4194 88.8426 16.3753C89.8001 17.4048 90.7111 18.4698 91.5745 19.5673L73.5386 33.7649C74.6235 35.1432 75.5761 36.6206 76.3835 38.1777L96.7579 27.6124C98.8149 31.5816 100.343 35.8106 101.297 40.1901L78.8731 45.0793C79.2468 46.793 79.4579 48.5382 79.5038 50.2916L102.446 49.6909C102.446 49.6952 102.446 49.6995 102.446 49.7037L79.4784 50.2982C79.3024 43.5007 76.6497 37.0016 72.0188 32.0224Z"
            fill="#2A3E98"
          />
        </svg>

        <svg
          width="103"
          height="144"
          viewBox="0 0 103 144"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            id="matter-path"
            d="M-0.00124014 130.868L82.0312 0L102.804 13.021L20.7714 143.889L-0.00124014 130.868Z"
            fill="black"
          />
        </svg>

        <svg
          width="87"
          height="102"
          viewBox="0 0 87 102"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            id="matter-path"
            d="M0 84.3185L13.6883 66.5441C13.6883 66.5441 26.5594 80.4368 42.9036 80.4368C52.9144 80.4368 61.2908 77.5765 61.2908 71.6517C61.2908 65.3183 56.7962 64.0925 42.0864 61.0279C22.8819 56.9419 6.12908 48.7697 6.12908 30.3824C6.12908 15.264 21.2475 0.145508 47.8068 0.145508C69.6672 0.145508 84.1727 11.9951 84.1727 11.9951L71.9146 29.9738C71.9146 29.9738 60.8822 21.5974 47.8068 21.5974C38.6132 21.5974 30.2368 24.8662 30.2368 30.791C30.2368 36.7158 36.7745 38.146 53.1187 41.6191C72.3232 45.7052 86.0114 52.0386 86.0114 72.0603C86.0114 88.6089 68.4414 101.889 43.7208 101.889C15.3227 101.889 0 84.3185 0 84.3185Z"
            fill="black"
          />
        </svg>

        <svg
          width="100"
          height="105"
          viewBox="0 0 100 105"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            id="matter-path"
            d="M75.0725 6.90967C98.0736 20.1894 107.042 49.194 92.1276 75.026C91.2083 76.6184 89.3695 79.8032 87.3539 82.8858L24.7202 46.7242C22.0222 55.0748 25.1757 69.6345 38.4455 77.2959C53.1308 85.7744 66.3498 82.0828 66.3498 82.0828L67.7721 104.136C67.7721 104.136 47.5559 108.506 27.2088 96.7584C1.73071 82.0486 -6.67198 51.2473 7.52711 26.6537C21.7262 2.06017 50.833 -7.08506 75.0725 6.90967ZM33.6074 31.3312L75.1862 55.3367C79.0206 47.8782 77.9156 34.2652 63.938 26.1953C50.3143 18.3296 38.6055 24.3086 33.6074 31.3312Z"
            fill="black"
          />
        </svg>

        <svg
          width="77"
          height="134"
          viewBox="0 0 77 134"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            id="matter-path"
            d="M0.794168 45.3914L5.87817 23.9203L24.3671 28.2982L31.0045 0.266545L54.8611 5.91541L48.2237 33.9471L76.6529 40.6787L71.5689 62.1497L43.1397 55.4182L34.1485 93.3902C31.4182 104.921 36.5821 109.713 42.9439 111.219C48.3117 112.49 53.6845 110.193 53.6845 110.193L57.8187 131.747C57.8187 131.747 47.4131 135.792 33.6955 132.544C15.4054 128.213 4.643 111.598 9.39749 91.5186L19.2831 49.7693L0.794168 45.3914Z"
            fill="black"
          />
        </svg>

        <svg
          width="98"
          height="123"
          viewBox="0 0 98 123"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            id="matter-path"
            d="M6.16653 60.5385L0.455743 39.2256L18.8085 34.308L11.3527 6.48279L35.0337 0.137502L42.4894 27.9627L70.7092 20.4012L76.42 41.7142L48.2002 49.2756L58.2998 86.968C61.3667 98.4138 68.1859 100.182 74.5008 98.4902C79.829 97.0625 83.4689 92.4915 83.4689 92.4915L97.334 109.504C97.334 109.504 90.0928 118.002 76.4763 121.65C58.3209 126.515 40.9642 116.994 35.6235 97.0628L24.5192 55.6209L6.16653 60.5385Z"
            fill="black"
          />
        </svg>

        <svg
          width="29"
          height="28"
          viewBox="0 0 29 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            id="matter-path"
            d="M2.254 19.9854 L8.7473 6.2491 C9.5626 4.5123 11.8355 3.7629 13.6934 4.5647 L27.4297 11.058 C29.2876 11.8599 30.0371 14.1328 29.2218 15.8696 L22.7286 29.6059 C21.9132 31.3427 19.6403 32.0921 17.7824 31.2903 L4.0461 24.7971 C2.1882 23.9953 1.4387 21.7224 2.254 19.9854 Z"
            fill="#2A3E98"
          />
        </svg>

        <svg
          width="70"
          height="97"
          viewBox="0 0 70 97"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            id="matter-path"
            d="M1.14441e-05 84.272L48.4199 0.40625L69.6517 12.6644L21.2318 96.5302L1.14441e-05 84.272Z"
            fill="black"
          />
        </svg>
      </div>
      <div
        id="matter-container"
        style={{
          overflow: "hidden",
          width: "80%",
          height: "100vh",
        }}
        ref={containerRef}
      ></div>
    </div>
  );
};

export default MatterScene;
