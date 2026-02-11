import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SignUp from '../features/auth/components/Signupmodal';

describe("Signupmodal Component", () => {

    let mockOnClose;
    let mockOnSignupSuccess;

    beforeEach(() => {
        mockOnClose = jest.fn();
        mockOnSignupSuccess = jest.fn();
    });



    test("컴포넌트가 올바르게 렌더링된다", () => {
        render(
            <SignUp
                isOpen={true}
                onClose={mockOnClose}
                onSignupSuccess={mockOnSignupSuccess}
            />
        );

        expect(screen.getByRole("heading", { name: "회원가입" })).toBeInTheDocument();
        expect(screen.getByPlaceholderText("아이디를 입력하세요")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("비밀번호를 입력하세요")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("이메일을 입력하세요")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("닉네임을 입력하세요")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "회원가입" })).toBeInTheDocument();
    });


    test("입력 없이 제출 시 에러 메시지를 표시한다", async () => {
        render(
            <SignUp
                isOpen={true}
                onClose={mockOnClose}
                onSignupSuccess={mockOnSignupSuccess}
            />
        );

        const signUpButton = screen.getByRole("button", { name: "회원가입" });
        fireEvent.click(signUpButton);

        const errorMessage = await screen.findByText("아이디, 비밀번호, 이메일, 닉네임을 모두 입력해주세요.");
        expect(errorMessage).toBeInTheDocument();
    });


    test("성공적으로 회원가입하면 onSignUpSuccess를 호출한다", async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ user: { id: 1, username: 'newuser' } }),
            })
        );

        render(
            <SignUp
                isOpen={true}
                onClose={mockOnClose}
                onSignupSuccess={mockOnSignupSuccess}
            />
        );

        fireEvent.change(screen.getByPlaceholderText("아이디를 입력하세요"), {
            target: { value: "newuser" }
        });
        fireEvent.change(screen.getByPlaceholderText("비밀번호를 입력하세요"), {
            target: { value: "password123" }
        });
        fireEvent.change(screen.getByPlaceholderText("이메일을 입력하세요"), {
            target: { value: "mirum@hs.ac.kr" }
        });
        fireEvent.change(screen.getByPlaceholderText("닉네임을 입력하세요"), {
            target: { value: "미룬이" }
        });

        const signUpButton = screen.getByRole("button", { name: "회원가입" });
        fireEvent.click(signUpButton);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith("/api/user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: 'newuser', password: 'password123', email: "mirum@hs.ac.kr", nickname: "미룬이" }),
            });
        });

        await waitFor(() => {
            expect(mockOnSignupSuccess).toHaveBeenCalledWith({ user: { id: 1, username: 'newuser' } });
            expect(mockOnClose).toHaveBeenCalled();
        });
    });



    test("회원가입 실패 시 에러 메시지를 표시한다", async () => {
        // 1. 회원가입 실패(409 Conflict)를 시뮬레이션하는 가짜 fetch 함수를 설정합니다.
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: false,
                status: 409,
            })
        );
        render(
            <SignUp
                isOpen={true}
                onClose={mockOnClose}
                onSignupSuccess={mockOnSignupSuccess}
            />
        );

        fireEvent.change(screen.getByPlaceholderText("아이디를 입력하세요"), {
            target: { value: "existinguser" }
        });
        fireEvent.change(screen.getByPlaceholderText("비밀번호를 입력하세요"), {
            target: { value: "password123" }
        });
        fireEvent.change(screen.getByPlaceholderText("이메일을 입력하세요"), {
            target: { value: "mirum@hs.ac.kr" }
        });
        fireEvent.change(screen.getByPlaceholderText("닉네임을 입력하세요"), {
            target: { value: "미룬이" }
        });

        const signUpButton = screen.getByRole("button", { name: "회원가입" });
        fireEvent.click(signUpButton);

        // 4. 에러 메시지가 화면에 나타나는지 확인
        const errorMessage = await screen.findByText('이미 사용 중인 아이디입니다.');
        expect(errorMessage).toBeInTheDocument();
        expect(mockOnSignupSuccess).not.toHaveBeenCalled();
    });



    test("오버레이 클릭 시 onClose가 호출된다", () => {
        render(
            <SignUp
                isOpen={true}
                onClose={mockOnClose}
                onSignupSuccess={mockOnSignupSuccess}
            />
        );
        // data-testid를 사용하여 오버레이 요소를 정확하게 선택합니다.
        const overlay = screen.getByTestId("overlay");
        fireEvent.mouseDown(overlay);
        expect(mockOnClose).toHaveBeenCalled();
    });
});