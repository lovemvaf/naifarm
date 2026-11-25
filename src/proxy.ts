import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const AUTH_REQUIRED = ["/account", "/cart", "/checkout"];

const ROLE_ROUTES: { prefix: string; role: string }[] = [
  { prefix: "/farmer", role: "farmer" },
  { prefix: "/volunteer", role: "volunteer" },
  { prefix: "/coordinator", role: "coordinator" },
  { prefix: "/organization", role: "organization" },
  { prefix: "/admin", role: "admin" },
];

const ROLE_HOME: Record<string, string> = {
  farmer: "/farmer",
  volunteer: "/volunteer",
  coordinator: "/coordinator",
  organization: "/organization",
  admin: "/admin",
  customer: "/account",
};

function matches(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  if (
    process.env.NEXT_PUBLIC_BYPASS_AUTH === "true" ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const needsAuth = AUTH_REQUIRED.some((prefix) => matches(pathname, prefix));
  const roleRoute = ROLE_ROUTES.find((entry) => matches(pathname, entry.prefix));

  if (!user && (needsAuth || roleRoute)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?redirect=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  if (user && roleRoute) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const role = profile?.role ?? "customer";
    if (role !== roleRoute.role && role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = ROLE_HOME[role] ?? "/account";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|images|geo|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|gif|ico|json|txt|xml)$).*)",
  ],
};
