import { defineComponent } from 'san';
import logo from './logo.svg';
import './App.css';
import { select as d3select, mouse as d3mouse } from 'd3-selection';
import { scaleLinear } from 'd3-scale';

import Pythagoras from './Pythagoras';

function throttleWithRAF(fn) {
    let running = false
    return function() {
        if (running) return
        running = true
        window.requestAnimationFrame(() => {
            fn.apply(this, arguments)
            running = false
        })
    }
}

const App = defineComponent({

    components: {
        'pythagoras': Pythagoras
    },

    template: `
        <div class="App">
            <div class="App-header">
                <img src="{{logo}}" class="App-logo" alt="logo" />
                <h2>This is a dancing Pythagoras tree</h2>
            </div>
            <p class="App-intro">
                <svg width="{{svg.width}}" height="{{svg.height}}"
                    style="border: 1px solid lightgray">

                    <pythagoras w="{{baseW}}"
                                h="{{baseW}}"
                                heightFactor="{{heightFactor}}"
                                lean="{{lean}}"
                                x="{{svg.width / 2 - 40}}"
                                y="{{svg.height - baseW}}"
                                lvl="{{0}}"
                                maxlvl="{{currentMax}}" />

                </svg>
            </p>
        </div>
    `,

    initData() {
        return {
            logo: logo,
            svg: this.svg,
            realMax: 11,
            currentMax: 0,
            baseW: 80,
            heightFactor: 0,
            lean: 0
        }
    },

    attached() {
        // ref element
        this.svgEl = this.el.querySelector('svg');

        // d3select(this.svgEl).on('mousemove', this.onMouseMove.bind(this));


        this.next();

    },

    next() {

        let currentMax = this.data.get('currentMax');
        let realMax = this.data.get('realMax');

        if (currentMax < realMax) {
            // console.log(currentMax, realMax)
            this.data.set('currentMax', currentMax + 1);
            setTimeout(this.next.bind(this), 500);
        }

    },

    svg: {
        width: 1280,
        height: 600
    },

    update: throttleWithRAF(function(x, y) {

        let scaleFactor = scaleLinear()
            .domain([this.svg.height, 0])
            .range([0, .8]);

        let scaleLean = scaleLinear()
            .domain([0, this.svg.width / 2, this.svg.width])
            .range([.5, 0, -.5]);

        // console.log('heightFactor', scaleFactor(y));
        // console.log('lean', scaleLean(x));

        this.data.set('heightFactor', scaleFactor(y));
        this.data.set('lean', scaleLean(x));

    }),

    onMouseMove(event) {

        const [x, y] = d3mouse(this.svgEl);

        this.update(x, y);

    }

})

export default App;
