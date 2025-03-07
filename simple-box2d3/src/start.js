
import DebugDrawRenderer from './debugDraw.js';
// import Box2DFactory from 'box2d3-wasm';

// const params = new URLSearchParams(window.location.search);
export function start(Box2DFactory) {
  Box2DFactory().then((box2d) => {

    const canvas = document.getElementById("gameCanvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    console.log('game setting canvas size', canvas.width, canvas.height);
    const ctx = canvas.getContext("2d");

    const pyramidHeight = 10; // params.get('pyramidHeight') ? parseInt(params.get('pyramidHeight')) : 10;
    const pixelsPerMeter = canvas.height / 72;
    console.log('pixelsPerMeter', pixelsPerMeter);
    const subStepCount = 4;

    const hdRendering = false; //params.get('hd') === '1';

    const debugDraw = new DebugDrawRenderer(box2d, ctx, pixelsPerMeter, hdRendering); // true for high dpi
    debugDraw.offset = {
      x: 40,
      y: -29
    };


    const {
      b2DefaultWorldDef,
      b2CreateWorld,
      b2CreateBody,
      b2CreatePolygonShape,
      b2CreateSegmentShape,
      b2World_Step,
      b2MakeBox,
      b2DefaultBodyDef,
      b2DefaultShapeDef,
      b2BodyType,
      b2Segment,
      b2Vec2,
      b2Rot,
      TaskSystem,
      b2CreateThreadedWorld,
      b2World_GetProfile,
    } = box2d;

    const worldDef = b2DefaultWorldDef();
    worldDef.gravity.Set(0, -10);

    let worldId, taskSystem;

    const statsLevel = 1; //params.get('stats') || 2;

    if(true) { //params.get('threading') === '1') {
      taskSystem = new TaskSystem(navigator.hardwareConcurrency);
      worldId = b2CreateThreadedWorld(worldDef, taskSystem);
    } else {
      worldId = b2CreateWorld(worldDef);
    }

    const bd_ground = new b2DefaultBodyDef();
    const groundId = b2CreateBody(worldId, bd_ground);

    const shapeDefSegment = new b2DefaultShapeDef();
    shapeDefSegment.density = 1.0;
    shapeDefSegment.friction = 0.3;

    {
      const segment = new b2Segment();
      segment.point1 = new b2Vec2(3, -4);
      segment.point2 = new b2Vec2(6, -7);

      b2CreateSegmentShape(groundId, shapeDefSegment, segment);
    }

    {
      const segment = new b2Segment();
      segment.point1 = new b2Vec2(3, -18);
      segment.point2 = new b2Vec2(22, -18)
      b2CreateSegmentShape(groundId, shapeDefSegment, segment);
    }

    {
      const segment = new b2Segment();
      segment.point1 = new b2Vec2(-100, -40);
      segment.point2 = new b2Vec2(100, -40)
      b2CreateSegmentShape(groundId, shapeDefSegment, segment);
    }

    const rot = new b2Rot();
    rot.SetAngle(0);

    function createPyramid(worldId, height, gap) {
      const boxWidth = 2;
      const boxHeight = 2;

      for (let row = 0; row < height; row++) {
          const boxesInRow = height - row;

          const startX = -(boxesInRow - 1) * (boxWidth + gap) / 2;

          for (let i = 0; i < boxesInRow; i++) {
              const bd = new b2DefaultBodyDef();
              bd.type = b2BodyType.b2_dynamicBody;

              const xPos = startX + i * (boxWidth + gap);
              const yPos = (boxHeight + gap) * row + boxHeight;
              bd.position = new b2Vec2().Set(xPos, yPos);

              const bodyId = b2CreateBody(worldId, bd);

              const shapeDefDynamic = new b2DefaultShapeDef();
              shapeDefDynamic.density = 1.0;
              shapeDefDynamic.friction = 0.3;

              const box = b2MakeBox(boxWidth/2, boxHeight/2);
              b2CreatePolygonShape(bodyId, shapeDefDynamic, box);
          }
      }
    }

    const boxGap = 0.1;
    createPyramid(worldId, pyramidHeight, boxGap);

    function drawProfile(stepDuration, profile) {
      // ctx.clearRect(0, 0, canvas.width, canvas.height);
      const hdScale = hdRendering ? (Math.min(window.devicePixelRatio || 1, 2) || 1) : 1;
      ctx.font = `${32 * hdScale}px Arial`;
      ctx.fillStyle = "white";
      if (statsLevel < 1) return;
      // ctx.fillText(`fps: ${Math.floor(1000/stepDuration)}`, 10 * hdScale, 20 * hdScale);
      ctx.fillText(`threading: ${taskSystem ? 'on' : 'off'}`, 160 * hdScale, 20 * hdScale);
      ctx.fillText(`cpus: ${navigator.hardwareConcurrency}  screen: ${canvas.width}x${canvas.height}`, 450 * hdScale, 20 * hdScale);
      if (statsLevel < 2) return;
      ctx.fillText(`step: ${profile.step.toFixed(2)}ms`, 10 * hdScale, 40 * hdScale);
      ctx.fillText(`pairs: ${profile.pairs.toFixed(2)}ms`, 10 * hdScale, 60 * hdScale);
      ctx.fillText(`collide: ${profile.collide.toFixed(2)}ms`, 10 * hdScale, 80 * hdScale);
      ctx.fillText(`solve: ${profile.solve.toFixed(2)}ms`, 10 * hdScale, 100 * hdScale);
      ctx.fillText(`buildIslands: ${profile.buildIslands.toFixed(2)}ms`, 10 * hdScale, 120 * hdScale);
      ctx.fillText(`solveConstraints: ${profile.solveConstraints.toFixed(2)}ms`, 10 * hdScale, 140 * hdScale);
      ctx.fillText(`prepareTasks: ${profile.prepareTasks.toFixed(2)}ms`, 10 * hdScale, 160 * hdScale);
      ctx.fillText(`solverTasks: ${profile.solverTasks.toFixed(2)}ms`, 10 * hdScale, 180 * hdScale);
      ctx.fillText(`prepareConstraints: ${profile.prepareConstraints.toFixed(2)}ms`, 10 * hdScale, 200 * hdScale);
      ctx.fillText(`integrateVelocities: ${profile.integrateVelocities.toFixed(2)}ms`, 10 * hdScale, 220 * hdScale);
      ctx.fillText(`warmStart: ${profile.warmStart.toFixed(2)}ms`, 10 * hdScale, 240 * hdScale);
      ctx.fillText(`solveVelocities: ${profile.solveVelocities.toFixed(2)}ms`, 10 * hdScale, 260 * hdScale);
      ctx.fillText(`integratePositions: ${profile.integratePositions.toFixed(2)}ms`, 10 * hdScale, 280 * hdScale);
      ctx.fillText(`relaxVelocities: ${profile.relaxVelocities.toFixed(2)}ms`, 10 * hdScale, 300 * hdScale);
      ctx.fillText(`applyRestitution: ${profile.applyRestitution.toFixed(2)}ms`, 10 * hdScale, 320 * hdScale);
      ctx.fillText(`storeImpulses: ${profile.storeImpulses.toFixed(2)}ms`, 10 * hdScale, 340 * hdScale);
      ctx.fillText(`finalizeBodies: ${profile.finalizeBodies.toFixed(2)}ms`, 10 * hdScale, 360 * hdScale);
      ctx.fillText(`sleepIslands: ${profile.sleepIslands.toFixed(2)}ms`, 10 * hdScale, 380 * hdScale);
      ctx.fillText(`splitIslands: ${profile.splitIslands.toFixed(2)}ms`, 10 * hdScale, 400 * hdScale);
      ctx.fillText(`hitEvents: ${profile.hitEvents.toFixed(2)}ms`, 10 * hdScale, 420 * hdScale);
      ctx.fillText(`broadphase: ${profile.broadphase.toFixed(2)}ms`, 10 * hdScale, 440 * hdScale);
      ctx.fillText(`continuous: ${profile.continuous.toFixed(2)}ms`, 10 * hdScale, 460 * hdScale);
    }

    let handle;
    let canRun = false;
    function loop(prevMs) {
      const nowMs = window.performance.now();
      handle = requestAnimationFrame(loop.bind(null, nowMs));
      // console.log(nowMs-prevMs, 1000/120);
      // const deltaMs = Math.min(nowMs-prevMs, 1000/120);
      const deltaMs = nowMs-prevMs;
      const start = performance.now();
      if (canRun) {
        b2World_Step(worldId, deltaMs / 1000, subStepCount);
      }
      const end = performance.now();
      taskSystem?.ClearTasks();
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      debugDraw.Draw(worldId);
      const duration = end - start;
      const profile = b2World_GetProfile(worldId);
      drawProfile(duration, profile);
    };
    setTimeout(() => {
      canRun = true;
    }, 200);

    loop(window.performance.now());



  });
}

