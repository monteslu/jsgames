import Box2DFactory from 'box2d-wasm';
import { makeDebugDraw } from './debugDraw.js';
import { getInput } from './utils.js';

console.log('box2d-wasm', Box2DFactory);

const Box2DFactory_ = Box2DFactory;
Box2DFactory_().then(box2D => {
  const {
    b2_dynamicBody,
    b2BodyDef,
    b2CircleShape,
    b2EdgeShape,
    b2Vec2,
    b2PolygonShape,
    b2World,
  } = box2D;

  let canAddItem = true;
  let bodies = [];

  function removeBody(body, world) {
    bodies = bodies.filter(b => b !== body);
    world.DestroyBody(body);
  }

  const canvas = document.getElementById("gameCanvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');

  const player = {
    x: 1,
    y: 1,
    speed: 5, // meters per second
  };

  const pixelsPerMeter = Math.round(canvas.width / 20);
  const cameraOffsetMetres = {
    x: 0,
    y: 0
  };

  const gravity = new b2Vec2(0, 10);
  const world = new b2World(gravity);

  const bd_ground = new b2BodyDef();
  const ground = world.CreateBody(bd_ground);

  console.log('ground', ground, bd_ground);

  // ramp which boxes fall onto initially
  {
    const shape = new b2EdgeShape();
    shape.SetTwoSided(new b2Vec2(3, 4), new b2Vec2(6, 7));
    ground.CreateFixture(shape, 0);
  }
  // floor which boxes rest on
  {
    const shape = new b2EdgeShape();
    shape.SetTwoSided(new b2Vec2(3, 14), new b2Vec2(15, 14));
    ground.CreateFixture(shape, 0);
  }
  // ramp which boxes launch off
  {
    const shape = new b2EdgeShape();
    shape.SetTwoSided(new b2Vec2(15, 14), new b2Vec2(17, 12.5));
    ground.CreateFixture(shape, 0);
  }

  const sideLengthMetres = 1;
  const square = new b2PolygonShape();
  square.SetAsBox(sideLengthMetres/2, sideLengthMetres/2);
  const circle = new b2CircleShape();
  circle.set_m_radius(sideLengthMetres/2);

  const ZERO = new b2Vec2(0, 0);
  const temp = new b2Vec2(0, 0);
  /**
   * @param {Box2D.b2Body} body
   * @param {number} index
   * @returns {void}
   */
  const initPosition = (body, index) => {
    temp.Set(4 + sideLengthMetres*(Math.random()-0.5), -sideLengthMetres*index);
    body.SetTransform(temp, 0);
    body.SetLinearVelocity(ZERO);
    body.SetAwake(1);
    body.SetEnabled(1);
  }

  // make falling boxes
  let boxCount = 10;
  let destroyCount = 0;
  for (let i = 0; i < boxCount; i++) {
    const bd = new b2BodyDef();
    bd.set_type(b2_dynamicBody);
    bd.set_position(ZERO);
    const body = world.CreateBody(bd);
    body.CreateFixture(i % 2 ? square : circle, 1);
    console.log('body', body);
    bodies.push(body);
    initPosition(body, i);
  }

  const makeAFallingItem = (createSeed) => {
    boxCount++;
    const bd = new b2BodyDef();
    bd.set_type(b2_dynamicBody);
    bd.set_position(new b2Vec2(player.x, player.y));
    const body = world.CreateBody(bd);
    body.CreateFixture(createSeed > 0.5 ? square : circle, 1);
    bodies.push(body);
    // initPosition(body, -1);
    body.SetLinearVelocity(ZERO);
    body.SetAwake(1);
    body.SetEnabled(1);
    return body;
  };

  const debugDraw = makeDebugDraw(ctx, pixelsPerMeter, box2D);
  world.SetDebugDraw(debugDraw);

  // calculate no more than a 20th of a second during one world.Step() call
  const maxTimeStepMs = 1/20*1000;
  let lastMadeBody = performance.now();
  const step = (deltaMs) => {
    const [p1] = getInput();

    const canMakeItem = (performance.now() - lastMadeBody) > 100;

    if (p1.DPAD_UP.pressed && (player.y > 0)) {
      player.y -= player.speed * deltaMs / 1000;
    }
    if (p1.DPAD_DOWN.pressed && (player.y < (canvas.height/pixelsPerMeter))) {
      player.y += player.speed * deltaMs / 1000;
    }
    if (p1.DPAD_LEFT.pressed && (player.x > 0)) {
      player.x -= player.speed * deltaMs / 1000;
    }
    if (p1.DPAD_RIGHT.pressed && (player.x < (canvas.width/pixelsPerMeter))) {
      player.x += player.speed * deltaMs / 1000;
    }
    if (p1.BUTTON_SOUTH.pressed && canMakeItem) {
      makeAFallingItem(Math.random());
      lastMadeBody = performance.now();
    } else if (p1.BUTTON_EAST.pressed && canMakeItem) {
      makeAFallingItem(1);
      lastMadeBody = performance.now();
    } else if (p1.BUTTON_WEST.pressed && canMakeItem) {
      makeAFallingItem(0);
      lastMadeBody = performance.now();
    }


    if (!p1.BUTTON_SOUTH.pressed) {
      canAddItem = true;
    }
    const clampedDeltaMs = Math.min(deltaMs, maxTimeStepMs);
    world.Step(clampedDeltaMs/1000, 3, 2);
    bodies.forEach(body => {
      if (body.GetPosition().y > 20) {
        removeBody(body, world);
        destroyCount++;
      }
    });
  };

  setInterval(() => {
    console.log('bodies', bodies.length, 'made', boxCount, 'destroyed', destroyCount, 'should exist', boxCount - destroyCount);
  }, 3500);
  const drawCanvas = () => {

    ctx.fillStyle = 'rgb(0,0,0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // ctx.strokeStyle = 'rgb(255,255,255)';
    // ctx.strokeRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgb(255,255,0)';
    ctx.fillRect(player.x * pixelsPerMeter - pixelsPerMeter / 8, player.y * pixelsPerMeter - pixelsPerMeter / 8, pixelsPerMeter / 4, pixelsPerMeter / 4);

    ctx.save();
    ctx.scale(pixelsPerMeter, pixelsPerMeter);
    const { x, y } = cameraOffsetMetres;
    ctx.translate(x, y);
    ctx.lineWidth /= pixelsPerMeter;
    
    ctx.fillStyle = 'rgb(255,255,0)';
    world.DebugDraw();

    ctx.restore();
  };

  let handle;
  (function loop(prevMs) {
    const nowMs = window.performance.now();
    handle = requestAnimationFrame(loop.bind(null, nowMs));
    const deltaMs = nowMs-prevMs;
    step(deltaMs);
    drawCanvas();
  }(window.performance.now()));
});