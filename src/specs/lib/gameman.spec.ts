import { fs } from "../../lib/fastify";
import { expect } from "chai";
import { Game } from "../../entity/game";
import { COOKIE_NAME } from "../../lib/dotenv";

describe("game route", function () {
	it("should return 401 when not authenticated", async function () {
		const response = await fs.inject({
			method: "POST",
			url: "/game",
			payload: { name: "horizon" },
		});

		expect(response.statusCode).to.equal(401);
	});

	describe("/game", function () {
		it("should create a game", async function () {
			const connect_request = await fs.inject({
				method: "POST",
				url: "/user/login",
				payload: { username: "TestMan", password: "test" },
			});

			const session_cookie = connect_request.cookies.find((cookie: { name: string }) => cookie.name === COOKIE_NAME) as {
				name: string;
				value: string;
				maxAge: number;
				path: string;
				httpOnly: boolean;
			};

			const response = await fs.inject({
				method: "POST",
				url: "/game",
				payload: { name: "horizon" },
				cookies: { [COOKIE_NAME]: session_cookie.value },
			});

			expect(response.statusCode).to.equal(201);
			expect(response.body).to.contain('"name":"horizon"');
		});

		it("should give the list of games", async function () {
			const connect_request = await fs.inject({
				method: "POST",
				url: "/user/login",
				payload: { username: "TestMan", password: "test" },
			});

			const session_cookie = connect_request.cookies.find((cookie: { name: string }) => cookie.name === COOKIE_NAME) as {
				name: string;
				value: string;
				maxAge: number;
				path: string;
				httpOnly: boolean;
			};

			const response = await fs.inject({
				method: "GET",
				url: "/game",
				cookies: { [COOKIE_NAME]: session_cookie.value },
			});

			expect(response.statusCode).to.equal(200);

			const game_list = JSON.parse(response.body) as Game[];
			const first_game = game_list[0].name;
			expect(first_game).to.equal("testGame");
		});
	});

	describe("/game/addUser", function () {
		it("should return 403 when trying to add an user to a game when not creator", async function () {
			const connect_request = await fs.inject({
				method: "POST",
				url: "/user/login",
				payload: { username: "TestMan2", password: "test" },
			});

			const session_cookie = connect_request.cookies.find((cookie: { name: string }) => cookie.name === COOKIE_NAME) as {
				name: string;
				value: string;
				maxAge: number;
				path: string;
				httpOnly: boolean;
			};

			const response = await fs.inject({
				method: "POST",
				url: "/game/addUser",
				payload: { idUser: 2, idGame: 1 },
				cookies: { [COOKIE_NAME]: session_cookie.value },
			});

			expect(response.statusCode).to.equal(403);
		});

		it("should add the user to the game", async function () {
			const connect_request = await fs.inject({
				method: "POST",
				url: "/user/login",
				payload: { username: "TestMan", password: "test" },
			});

			const session_cookie = connect_request.cookies.find((cookie: { name: string }) => cookie.name === COOKIE_NAME) as {
				name: string;
				value: string;
				maxAge: number;
				path: string;
				httpOnly: boolean;
			};

			const response = await fs.inject({
				method: "POST",
				url: "/game/addUser",
				payload: { idUser: 2, idGame: 1 },
				cookies: { [COOKIE_NAME]: session_cookie.value },
			});

			expect(response.statusCode).to.equal(200);
		});
	});

	describe("/game/createMap", function () {
		it("should create a map", async function () {
			const connect_request = await fs.inject({
				method: "POST",
				url: "/user/login",
				payload: { username: "TestMan", password: "test" },
			});

			const session_cookie = connect_request.cookies.find((cookie: { name: string }) => cookie.name === COOKIE_NAME) as {
				name: string;
				value: string;
				maxAge: number;
				path: string;
				httpOnly: boolean;
			};

			const response = await fs.inject({
				method: "POST",
				url: "/game/createMap",
				payload: { gameId: 1, height: 10, width: 10, seed: 12345, noSeed: false, perThousand: 16 },
				cookies: { [COOKIE_NAME]: session_cookie.value },
			});

			const expected_map =
				"10;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;1;1;0;0;0;0;0;0;0;0;0;1;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0";

			const response_map = JSON.parse(response.body) as { map: string };

			expect(response.statusCode).to.equal(200);
			expect(response_map.map).to.equal(expected_map);
		});
	});

	describe("/game/map/:id", function () {
		it("should give the map", async function () {
			const connect_request = await fs.inject({
				method: "POST",
				url: "/user/login",
				payload: { username: "TestMan", password: "test" },
			});

			const session_cookie = connect_request.cookies.find((cookie: { name: string }) => cookie.name === COOKIE_NAME) as {
				name: string;
				value: string;
				maxAge: number;
				path: string;
				httpOnly: boolean;
			};

			const response = await fs.inject({
				method: "GET",
				url: "/game/map/1",
				cookies: { [COOKIE_NAME]: session_cookie.value },
			});

			expect(response.statusCode).to.equal(200);

			const expected_map =
				"10;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;1;1;0;0;0;0;0;0;0;0;0;1;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0";

			const response_map = JSON.parse(response.body) as { map: string };

			expect(response_map.map).to.equal(expected_map);
		});
	});
});
