import { rest } from "msw"

const baseURL = "https://djangofw-api.herokuapp.com/"

export const handlers = [
    rest.get(`${baseURL}dj-rest-auth/user/`, (req, res, ctx) => {
        return res(ctx.json({
            "pk": 2,
            "username": "keiron",
            "email": "",
            "first_name": "",
            "last_name": "",
            "profile_id": 2,
            "profile_image": "https://res.cloudinary.com/twiggygnome/image/upload/v1/media/images/github_me_t7tfww"
            })
        );
    }),
    rest.post(`${baseURL}dj-rest-auth/user/logout/`, (req, res, ctx) => {
        return res(ctx.status(200));
    }),
];