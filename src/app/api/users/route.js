import { NextResponse } from 'next/server';
import { User } from '@/entities/users/User';
import { UserRepository } from '@/repositories/UserRepository';

export async function GET() {
    try {
        const userRepository = new UserRepository();
        const data = await userRepository.findMany();
        const users = data.map(u => User.fromDatabase(u));
        return NextResponse.json(
            { users },
            { status: 200 }
        );
    } catch(error) {
        console.error('Get users error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(req) {
    try {
        // COLOCAR POR AQUI O SIGNUP ?
        const body = await req.json();
        const user = new User(body);
        if(!user.email || !user.organizationId) {
            return NextResponse.json(
                { error: 'Email and organizationId are required' },
                { status: 400 }
            );
        }
        const userRepository = new UserRepository();
        const data = await userRepository.create(user);
        const savedUser = User.fromDatabase(data);
        return NextResponse.json(
            { user: savedUser },
            { status: 201 }
        );
    } catch(error) {
        console.error('Create user error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}