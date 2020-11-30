# transition-grid-element
 Web Component that enables grid layouts to animate.

## Support
- Web Animation API
- Mutation Observer

## Instructions
The usage of the element is meant to be as easy as possible. This means that the element should only concern itself about the children it has and should be able to be used anywhere possible.
```
transition-grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
}
```
```
<transition-grid>
	<div class="grid-item"></div>
	<div class="grid-item"></div>
	<div class="grid-item"></div>
</transition-grid>
```

[See the demo](https://emielzuurbier.github.io/transition-grid-element/)