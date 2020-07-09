import {FaceUtils, VoxelFace} from "./math/face";
import {vec3} from "gl-matrix";
import {getVectorKey, isIntVec, VectorKey} from "./math/math";
import {ChunkIndex} from "./math/chunkIndex";

// TODO: Voxel pointers, traversal and building utilities
// TODO: Ray casts and rigid bodies
export class VoxelWorld<TWrapped> {
    private readonly chunks = new Map<VectorKey, VoxelChunk<TWrapped>>();

    constructor(public readonly chunk_size: number) {}

    addChunk(pos: vec3, wrapped_instance: TWrapped): VoxelChunk<TWrapped> {
        console.assert(!this.chunks.has(getVectorKey(pos)) && isIntVec(pos));

        const instance = new VoxelChunk(wrapped_instance, this.chunk_size);
        this.chunks.set(getVectorKey(pos), instance);

        // Link with neighbors
        for (const face of FaceUtils.getFaces()) {
            // Find neighbor position
            const axis = FaceUtils.getAxis(face);
            const sign = FaceUtils.getSign(face);
            pos[axis] += sign;

            // Find neighbor and link
            const neighbor = this.chunks.get(getVectorKey(pos));
            if (neighbor != null)
                instance.linkToNeighbor(face, neighbor);

            // Revert position vector to original state
            pos[axis] -= sign;
        }

        return instance;
    }

    removeChunk(pos: vec3) {
        return this.chunks.delete(getVectorKey(pos));
    }

    getChunk(pos: vec3) {
        return this.chunks.get(getVectorKey(pos));
    }
}

export class VoxelChunk<TWrapped> {
    private readonly neighbors: (VoxelChunk<TWrapped> | undefined)[] = new Array(6);
    private readonly data: Uint16Array;

    constructor(public readonly parent: TWrapped, public readonly chunk_size: number) {
        this.data = new Uint16Array(2 * chunk_size ** 3);
    }

    linkToNeighbor(face: VoxelFace, other: VoxelChunk<TWrapped>) {
        this.neighbors[face] = other;
        other.neighbors[FaceUtils.getInverse(face)] = this;
    }

    getNeighbor(face: VoxelFace) {
        return this.neighbors[face];
    }

    setVoxel(pos: ChunkIndex, type: number, data: number) {
        pos *= 2;  // Two shorts per voxel
        this.data[pos] = type;
        this.data[pos + 1] = data;
    }

    getVoxelRaw(pos: ChunkIndex): { type: number, data: number } {
        pos *= 2;  // Two shorts per voxel
        return {
            type: this.data[pos],
            data: this.data[pos + 1]
        };
    }
}