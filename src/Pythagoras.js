import { defineComponent } from 'san';
import { interpolateViridis } from 'd3-scale';

Math.deg = function(radians) {
  return radians * (180 / Math.PI);
};

const memoizedCalc = function () {
    const memo = {};

    const key = ({ w, heightFactor, lean }) => [w, heightFactor, lean].join('-');

    return (args) => {

        const memoKey = key(args);

        if (memo[memoKey]) {
            return memo[memoKey];
        }
        else {

            const { w, heightFactor, lean } = args;

            const trigH = heightFactor*w;

            const result = {
                nextRight: Math.sqrt(trigH**2 + (w * (.5+lean))**2),
                nextLeft: Math.sqrt(trigH**2 + (w * (.5-lean))**2),
                A: Math.deg(Math.atan(trigH / ((.5-lean) * w))),
                B: Math.deg(Math.atan(trigH / ((.5+lean) * w)))
            };

            memo[memoKey] = result;

            return result;
        }
    }

}();

var Pythagoras = defineComponent({

    initData: function() {
        return {
            left: 0,
            right: 0,
            nextLeft: 0,
            nextRight: 0,
            w: 0,
            x: 0,
            y: 0,
            lvl: 0,
            maxlvl: 0
        };
    },

    components: {
        'pythagoras': 'self'
    },

    template: `
        <g transform="translate({{x}} {{y}}) {{ gRotate(left,right,calcNext,w) }}" >
            <rect
                width="{{ w }}" height="{{ w }}"
                x="0" y="0"
                style="fill: {{ lvl | styleFill(maxlvl) }}" />

            <pythagoras
                san-if="{{ lvl < maxlvl && w > 2 }}"
                w="{{ calcNext.nextLeft }}"
                x="{{ 0 }}"
                y="{{ 0 - calcNext.nextLeft }}"
                lvl="{{ lvl + 1 }}"
                maxlvl="{{ maxlvl }}"
                heightFactor="{{ heightFactor }}"
                lean="{{ lean }}"
                left="{{ 1 }}" />

            <pythagoras
                san-if="{{ lvl < maxlvl && w > 2 }}"
                w="{{ calcNext.nextRight }}"
                x="{{ w - calcNext.nextRight }}"
                y="{{ 0 - calcNext.nextRight }}"
                lvl="{{ lvl + 1 }}"
                maxlvl="{{ maxlvl }}"
                heightFactor="{{ heightFactor }}"
                lean="{{ lean }}"
                right="{{ 1 }}" />

        </g>
    `,

    filters: {
        styleFill: function (a, b) {
            return interpolateViridis(a / b)
        }
    },

    gRotate: function (left, right, calcNext, w) {
        const { nextRight, nextLeft, A, B } = calcNext;

        if (left) {
            return `rotate(${-A} 0 ${w})`;
        }
        
        if (right) {
            return `rotate(${B} ${w} ${w})`;
        }
        return ''
    },

    computed: {

        calcNext: function() {
            return memoizedCalc({
                w: this.data.get('w'),
                heightFactor: this.data.get('heightFactor'),
                lean: this.data.get('lean')
            });
        }
    }

});



export default Pythagoras;
