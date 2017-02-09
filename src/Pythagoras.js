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

        console.log('initData');

        return {
            left: 0,
            right: 0
        };
    },

    template: `
        <g transform="translate({{x}} {{y}}) {{0 | rotate(w, x, y, heightFactor, lean, left, right) }}">
            <rect
                width="{{ w }}" height="{{ w }}"
                x="0" y="0"
                style="fill: {{ lvl / maxlvl | interpolateViridis }}" />

            <pythagoras
                san-if="lvl < maxlvl && w > 1"
                w="{{ 'nextLeft' | calc(w, x, y, heightFactor, lean) }}"
                x="{{ 0 }}"
                y="{{ 'nextLeft' | calc(w, x, y, heightFactor, lean) | minuend }}"
                lvl="{{ lvl + 1 }}" maxlvl="{{ maxlvl }}"
                heightFactor="{{ heightFactor }}"
                lean="{{ lean }}"
                left="{{ 1 }}" />

            <pythagoras
                san-if="lvl < maxlvl && w > 1"
                w="{{ 'nextRight' | calc(w, x, y, heightFactor, lean) }}"
                x="{{ 'nextRight' | calc(w, x, y, heightFactor, lean) | minuend(w) }}"
                y="{{ 'nextRight' | calc(w, x, y, heightFactor, lean) | minuend }}"
                lvl="{{ lvl + 1 }}" maxlvl="{{ maxlvl }}"
                heightFactor="{{ heightFactor }}"
                lean="{{ lean }}"
                right="{{ 1 }}" />
        </g>
    `,


    filters: {

        minuend: function(subtractor, target) {
            return (target || 0) - subtractor;
        },

        calc: function(key, w, x, y, heightFactor, lean) {

            var ret = memoizedCalc({
                w: w,
                heightFactor: heightFactor,
                lean: lean
            })[key];

            console.log(key, ret)

            return ret;

        },

        rotate: function(placeholder, w, x, y, heightFactor, lean, left, right) {

            const { nextRight, nextLeft, A, B } = memoizedCalc({
                w: w,
                heightFactor: heightFactor,
                lean: lean
            });

            let rotate = '';

            if (left) {
                rotate = `rotate(${-A} 0 ${w})`;
            }
            else if (right) {
                rotate = `rotate(${B} ${w} ${w})`;
            }

            return rotate;

        },
        interpolateViridis: interpolateViridis
    },

    attached() {

        // console.log(this);

    }

});

// lift self
Pythagoras.prototype.components = {
    pythagoras: Pythagoras
};

export default Pythagoras;
