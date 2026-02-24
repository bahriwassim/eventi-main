import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // Refresh session if expired - this is done automatically by getUser() but we can handle errors gracefully
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  // Handle Refresh Token Not Found or other auth errors by clearing invalid session
  if (authError && authError.message.includes('Refresh Token Not Found')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    // Clear cookies to prevent loop
    const response = NextResponse.redirect(url)
    response.cookies.delete('sb-cndbaquchxdgipnjkbtz-auth-token') // Adjust based on project ref if known, or clear all supabase cookies
    // Since we don't know exact cookie name easily without project ref, we rely on the redirect to clear state eventually
    // or we can try to sign out. But server-side signout might fail if token is invalid.
    return response
  }

  const pathname = request.nextUrl.pathname
  const requiresAuth =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/super-admin') ||
    pathname.startsWith('/gate')

  if (requiresAuth && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    const redirect = NextResponse.redirect(url)
    // Copier les cookies du supabaseResponse vers la redirection
    supabaseResponse.cookies.getAll().forEach(({ name, value, options }) => {
      redirect.cookies.set(name, value, options)
    })
    return redirect
  }

  if (user) {
    const isAdminPath = pathname.startsWith('/admin')
    const isSuperAdminPath = pathname.startsWith('/super-admin')
    const isGatePath = pathname.startsWith('/gate')

    if (isAdminPath || isSuperAdminPath || isGatePath) {
      const { data: superAdmin } = await supabase
        .from('super_admins')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()

      const { data: admin } = await supabase
        .from('admins')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()

      const { data: gate } = await supabase
        .from('gate_personnel')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()

      const isSuperAdmin = !!superAdmin
      const isAdmin = !!admin
      const isGate = !!gate

      if (isSuperAdminPath && !isSuperAdmin) {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        const redirect = NextResponse.redirect(url)
        supabaseResponse.cookies.getAll().forEach(({ name, value, options }) => {
          redirect.cookies.set(name, value, options)
        })
        return redirect
      }

      if (isAdminPath && !(isAdmin || isSuperAdmin)) {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        const redirect = NextResponse.redirect(url)
        supabaseResponse.cookies.getAll().forEach(({ name, value, options }) => {
          redirect.cookies.set(name, value, options)
        })
        return redirect
      }

      if (isGatePath && !(isGate || isAdmin || isSuperAdmin)) {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        const redirect = NextResponse.redirect(url)
        supabaseResponse.cookies.getAll().forEach(({ name, value, options }) => {
          redirect.cookies.set(name, value, options)
        })
        return redirect
      }
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  return supabaseResponse
}
