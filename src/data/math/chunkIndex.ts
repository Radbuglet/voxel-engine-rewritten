import {Axis} from "./face";
import {vec3} from "gl-matrix";

export const BITS_PER_CHUNK_COMP = 4;
export const CHUNK_SIZE = 2 ** BITS_PER_CHUNK_COMP;

export type ChunkIndex = number;
export const ChunkIndex = {
    fromVector(x: number, y: number, z: number) {
        return x + (y << BITS_PER_CHUNK_COMP) + (z << 2 * BITS_PER_CHUNK_COMP);
    },
    addToVector(index: ChunkIndex, target: vec3 = vec3.create()) {
        target[0] += index & CHUNK_SIZE;
        index = index >> BITS_PER_CHUNK_COMP;
        target[1] += index & CHUNK_SIZE;
        index = index >> BITS_PER_CHUNK_COMP;
        target[2] += index & CHUNK_SIZE;
        return target;
    },
    getComponent(index: ChunkIndex, axis: Axis) {
        return (index >> axis * BITS_PER_CHUNK_COMP) & CHUNK_SIZE;
    },
    add(index: ChunkIndex, axis: Axis, delta: number) {
        const axis_value = this.getComponent(index, axis) + delta;
        return {
            traversed_chunks: axis_value >> BITS_PER_CHUNK_COMP,
            index: index - index & (CHUNK_SIZE << BITS_PER_CHUNK_COMP * axis_value)  // Removes previous component value
                + axis_value & CHUNK_SIZE  // Adds the new wrapped component value
        };
    }
};