// Only what Blocks.svelte uses, re-exported by name so the bundler can drop
// the rest of three.js. Importing the whole namespace ships all of it.
export {
	BufferGeometry,
	Color,
	DirectionalLight,
	Float32BufferAttribute,
	Group,
	HemisphereLight,
	InstancedMesh,
	LineBasicMaterial,
	LineSegments,
	Material,
	Matrix4,
	MeshBasicMaterial,
	MeshStandardMaterial,
	PerspectiveCamera,
	Raycaster,
	Scene,
	Vector2,
	WebGLRenderer
} from 'three';
export { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
