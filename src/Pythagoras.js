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
            right: 0
        };
    },

    template: `
        <g transform="{{ gTransform }}" >
            <rect
                width="{{ w }}" height="{{ w }}"
                x="0" y="0"
                style="{{ rectStyle }}" />

            <pythagoras
                san-if="{{ hasNext }}"
                w="{{ nextLeft }}"
                x="{{ 0 }}"
                y="{{ 0 - nextLeft }}"
                lvl="{{ lvl + 1 }}"
                maxlvl="{{ maxlvl }}"
                heightFactor="{{ heightFactor }}"
                lean="{{ lean }}"
                left="{{ 1 }}" />

            <pythagoras
                san-if="{{ hasNext }}"
                w="{{ nextRight }}"
                x="{{ w - nextRight }}"
                y="{{ 0 - nextRight }}"
                lvl="{{ lvl + 1 }}"
                maxlvl="{{ maxlvl }}"
                heightFactor="{{ heightFactor }}"
                lean="{{ lean }}"
                right="{{ 1 }}" />

        </g>
    `,

    computed: {

        rectStyle: function() {
            return 'fill:' + interpolateViridis(this.data.get('lvl') / this.data.get('maxlvl'));
        },

        nextRight: function() {

            var ret = memoizedCalc({
                w: this.data.get('w'),
                heightFactor: this.data.get('heightFactor'),
                lean: this.data.get('lean')
            });

            return ret.nextRight;
        },

        nextLeft: function() {

            var ret = memoizedCalc({
                w: this.data.get('w'),
                heightFactor: this.data.get('heightFactor'),
                lean: this.data.get('lean')
            });

            return ret.nextLeft;
        },

        hasNext: function() {
            return this.data.get('lvl') < this.data.get('maxlvl') && this.data.get('w') > 2;
        },

        gTransform: function() {

            let w = this.data.get('w');
            let x = this.data.get('x');
            let y = this.data.get('y');
            let heightFactor = this.data.get('heightFactor');
            let lean = this.data.get('lean');

            const { nextRight, nextLeft, A, B } = memoizedCalc({
                w: w,
                heightFactor: heightFactor,
                lean: lean
            });

            let rotate = '';

            if (this.data.get('left')) {
                rotate = `rotate(${-A} 0 ${w})`;
            }
            else if (this.data.get('right')) {
                rotate = `rotate(${B} ${w} ${w})`;
            }

            console.log(`translate(${x} ${y}) ${rotate}`)

            return `translate(${x} ${y}) ${rotate}`;

        }
    },

    attached() {
        console.log(this.data.data)
    }

});

// lift self
Pythagoras.prototype.components = {
    pythagoras: Pythagoras
};

export default Pythagoras;
