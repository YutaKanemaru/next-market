import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request) {
        const token = request.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    try {
        const secretKey = new TextEncoder().encode("next-market-app-book");
        const decodedJwt = await jwtVerify(token, secretKey);
        return NextResponse.next();
    } catch {
        return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }
}

export const config = {
    matcher: [
        "/api/item/create",
        "/api/item/update/:path*",
        "/api/item/delete/:path*",
    ]
};