export function debounceFactory(func: Function, amount: number) {
	let timeout: number | null = null;

	return ((...args: any[]) => {
		if (timeout) {
			window.clearTimeout(timeout);
		}
		timeout = window.setTimeout((() => {
			func(...args);
		}), amount)
	})
}
