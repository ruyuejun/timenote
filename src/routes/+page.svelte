<script lang="ts">
	import { onMount } from 'svelte'
	import { getToken, setOnAuthExpired, setToken } from '@/api/request'
	import ToastHost from '$lib/ui/ToastHost.svelte'
	import { logout } from '@/stores/auth'
	import { session } from '@/stores/session'
	import AppLayout from '@/views/app-layout.svelte'
	import LoginPage from '@/views/login-page.svelte'
	import '@fontsource-variable/noto-sans-sc/index.css'
	import 'prosemirror-tables/style/tables.css'
	import '@/assets/styles/index.scss'

	onMount(() => {
		const token = $session?.token || getToken()
		if (token) setToken(token)
		else session.set(null)

		setOnAuthExpired(() => logout())
		return () => setOnAuthExpired(null)
	})

	$effect(() => {
		if ($session?.token) setToken($session.token)
	})
</script>

{#if $session?.token}
	<AppLayout />
{:else}
	<LoginPage />
{/if}

<ToastHost />
