<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SavedCard;

class SavedCardController extends Controller
{
    /**
     * Displays a list of the saved cards for the authenticated user.
     */
    public function index(Request $request)
    {
        $cards = $request->user()->savedCards()
            ->select('id', 'cardholder_name', 'last_four', 'brand', 'expiry_month', 'expiry_year', 'token')
            ->orderByDesc('created_at')
            ->get();

        return response()->json($cards);
    }

    /**
     * Removes the specified saved card.
     */
    public function destroy(Request $request, SavedCard $savedCard)
    {
        if ($savedCard->user_id !== $request->user()->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $savedCard->delete();

        return response()->json(['message' => 'Tarjeta eliminada correctamente']);
    }
}
