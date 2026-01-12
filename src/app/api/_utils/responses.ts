import { NextResponse } from "next/server";

export function ok(data: unknown, init?: ResponseInit) {
   return NextResponse.json(data, { status: 200, ...init });
}

export function created(data: unknown, init?: ResponseInit) {
   return NextResponse.json(data, { status: 201, ...init });
}

export function badRequest(message: string) {
   return NextResponse.json({ message }, { status: 400 });
}

export function notFound(message: string) {
   return NextResponse.json({ message }, { status: 404 });
}

export function conflict(message: string) {
   return NextResponse.json({ message }, { status: 409 });
}

export function serverError(message = "সার্ভার ত্রুটি") {
   return NextResponse.json({ message }, { status: 500 });
}
