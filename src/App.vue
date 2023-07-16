<script setup>
    import { ref } from 'vue';
    import Game from './game'
    new Game();
</script>

<template>
    <div class="topRight">
        Volume <input id="volume" type="range" min="0" max="1" value="0.2" step="0.01">
    </div>
    <div class="centered">
        <canvas id="canvas"></canvas>
    </div>
</template>

<style>
    body {
        /* ALIGNMENTS */
        display: flex;
        justify-content: center;

        margin: 0;
        overflow: hidden;

        /* COLORS */
        background-color: #000000;
        color: #00ff00;
    }

    canvas {
        height: 100dvh;
        image-rendering: pixelated;
        background-color: #00000000;
        color: green;
    }

    .topRight {
        position: absolute;
        top: 0;
        right: 0;
    }

    .centered {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }
</style>
