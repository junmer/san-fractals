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
        <g transform="{{ gTransform }}" >
            <rect
                width="{{ w }}" height="{{ w }}"
                x="0" y="0"
                style="{{ rectStyle }}" />
            </rect>

            <pythagoras
                san-if="{{ lvl < maxlvl && w > 2 }}"
                w="{{ nextLeft }}"
                x="{{ 0 }}"
                y="{{ 0 - nextLeft }}"
                lvl="{{ lvl + 1 }}"
                maxlvl="{{ maxlvl }}"
                heightFactor="{{ heightFactor }}"
                lean="{{ lean }}"
                left="{{ 1 }}" >
            </pythagoras>

            <pythagoras
                san-if="{{ lvl < maxlvl && w > 2 }}"
                w="{{ nextRight }}"
                x="{{ w - nextRight }}"
                y="{{ 0 - nextRight }}"
                lvl="{{ lvl + 1 }}"
                maxlvl="{{ maxlvl }}"
                heightFactor="{{ heightFactor }}"
                lean="{{ lean }}"
                right="{{ 1 }}" >
            </pythagoras>

        </g>
    `,

    computed: {

        rectStyle: function() {
            return 'fill:' + interpolateViridis(this.data.get('lvl') / this.data.get('maxlvl'));
        },

        calcNext: function() {
            return memoizedCalc({
                w: this.data.get('w'),
                heightFactor: this.data.get('heightFactor'),
                lean: this.data.get('lean')
            });
        },

        nextRight: function() {
            return this.data.get('calcNext').nextRight;
        },

        nextLeft: function() {
            return this.data.get('calcNext').nextLeft;
        },

        gTransform: function() {

            let w = this.data.get('w');
            let x = this.data.get('x');
            let y = this.data.get('y');

            const { nextRight, nextLeft, A, B } = this.data.get('calcNext');

            let rotate = '';

            if (this.data.get('left')) {
                rotate = `rotate(${-A} 0 ${w})`;
            }
            else if (this.data.get('right')) {
                rotate = `rotate(${B} ${w} ${w})`;
            }

            return `translate(${x} ${y}) ${rotate}`;

        }
    },


    // inited() {
    //     console.log('inited')
    //     console.log(this.data.get('lvl'))
    // },

    // updated() {
    //     console.log('updated',this.el.id)
    //     console.log(this.data.get('lvl'))
    // },

    // attached() {
    //     console.log('attached', this.el.id)
    //     console.log(this.data.get('lvl'))
    // }

});



export default Pythagoras;
