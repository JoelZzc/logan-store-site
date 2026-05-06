<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AddressResource;
use Illuminate\Http\Request;
use App\Models\Address;

class AddressController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        return  AddressResource::collection($request->user()->addresses);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'street' => 'nullable|string|max:255',
            'city'  =>'required|string|max:100',
            'state'  =>'required|string|max:100',
            'zip_code'  =>'required|string|max:20',
            'country'  =>'required|string|size:2',
            'is_default'  =>'nullable|boolean',
        ]);

        $address = Address::create([
            'user_id' => $request->user()->id,
            'street' => $validated['street'] ?? null,
            'city' => $validated['city'],
            'state' => $validated['state'],
            'zip_code' => $validated['zip_code'],
            'country' => $validated['country'],
            'is_default' => $validated['is_default'] ?? null,
        ]);

        $resource = new AddressResource($address);
        
        return $resource->response()->setStatusCode(201);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Address $address)
    {
        $validated = $request->validate([
            'street' => 'nullable|string|max:255',
            'city'  =>'sometimes|string|max:100',
            'state'  =>'sometimes|string|max:100',
            'zip_code'  =>'sometimes|string|max:20',
            'country'  =>'sometimes|string|size:2',
            'is_default'  =>'nullable|boolean',
        ]);

        $address->update($validated);

        return new AddressResource($address);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Address $address)
    {
        $address->delete();

        return response()->json(['message' => 'Direccion eliminada'], 200);
    }
}
