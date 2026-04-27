<script lang="ts">
	export let variant: 'primary' | 'secondary' | 'danger' | 'ghost' = 'primary';
	export let size: 'sm' | 'md' | 'lg' = 'md';
	export let disabled = false;
	export let type: 'button' | 'submit' | 'reset' = 'button';

	const variantClasses: Record<string, string> = {
		primary: 'bg-blue-600 hover:bg-blue-700 text-white',
		secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
		danger: 'bg-red-600 hover:bg-red-700 text-white',
		ghost: 'bg-transparent hover:bg-gray-100 text-gray-900'
	};

	const sizeClasses: Record<string, string> = {
		sm: 'px-3 py-1 text-sm',
		md: 'px-4 py-2 text-base',
		lg: 'px-6 py-3 text-lg'
	};

	const baseClasses =
		'inline-flex items-center justify-center font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed';

	$: buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${$$props.class || ''}`;
</script>

<button {disabled} class={buttonClasses} on:click {type}>
	<slot />
</button>

<style>
	button {
		border: none;
		cursor: pointer;
	}

	button:disabled {
		cursor: not-allowed;
	}
</style>
